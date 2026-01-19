/*
 * FusionOS Nexus - Boot Stub (ARM64 Assembly)
 * 
 * This is the first code executed after the bootloader transfers control.
 * It sets up the initial CPU state, initializes the MMU, and jumps to the
 * C kernel entry point.
 * 
 * Architecture: ARM64 (AArch64)
 * Target: Cortex-A72 / Cortex-A53 (ARMv8-A)
 * 
 * Boot Sequence:
 *   1. Set exception level (EL2 or EL1 depending on boot mode)
 *   2. Initialize SP (stack pointer)
 *   3. Zero BSS section
 *   4. Set up initial page tables for MMU
 *   5. Enable MMU and caches
 *   6. Jump to C kernel entry
 * 
 * Notes:
 *   - This code runs in EL2 (Hypervisor) or EL1 (Kernel) mode
 *   - Uses AArch64 instruction set (not AArch32)
 *   - Position independent code (PIC) not required for boot stub
 */

#include <kernel/kernel.h>

/*
 * Assembly macros and definitions
 */
.section ".boot", "ax"

/*
 * Entry point - where the bootloader transfers control
 * This symbol is defined as the kernel entry in the linker script
 */
.global start
.type start, %function

/*
 * Boot diagnostics buffer - stores early boot messages
 */
.section ".boot.data", "aw"
boot_magic:
    .asciz "FUSION"
boot_version:
    .asciz "1.0.0-NEXUS"
boot_stage:
    .byte 0

/*
 * Text section - boot code
 */
.text

/*
 * start - Kernel entry point
 * 
 * Input: 
 *   x0 = ARM machine type (ATAGs or Device Tree pointer)
 *   x1 = Bootloader ATAG pointer or Device Tree pointer
 *   x2 = Boot command line (if available)
 *   x3 = Reserved
 * 
 * The boot stub preserves these registers for the kernel if needed.
 */
start:
    /*
     * Save boot arguments in callee-saved registers
     * These will be passed to the kernel entry point
     */
    mov x19, x0          // Save machine type / DTB pointer
    mov x20, x1          // Save ATAG/DTB pointer
    mov x21, x2          // Save boot args
    mov x22, x3          // Reserved

    /*
     * Check current Exception Level
     * If we're in EL3 (Secure Monitor), drop to EL2
     * If we're in EL2 (Hypervisor), stay or drop to EL1
     */
    mrs x0, CurrentEL    // Read current exception level
    and x0, x0, 0xC      // Extract EL bits (bits 2-3)
    
    cmp x0, 0xC          // EL3?
    b.eq from_el3        // Branch if in EL3
    
    cmp x0, 0x8          // EL2?
    b.eq from_el2        // Branch if in EL2
    
    /*
     * Already in EL1 or EL0 - continue boot
     */
    b continue_boot

from_el3:
    /*
     * Transition from EL3 to EL2
     * This is common when Secure Monitor is used
     * Set EL2 as the target for next boot
     */
    mov x0, #0x5C11      // RMR_EL2: Run enable, RST=0
    msr rmr_el2, x0      // Configure EL2
    
    /*
     * Configure SCR_EL3 (Secure Configuration Register)
     * Enable EL2 access and disable secure monitor calls
     */
    mov x0, #0x00000331  // SCR_EL3: NS=1, HCE=1, SMD=1, etc.
    msr scr_el3, x0
    
    /*
     * Set SPSR_EL3 (Saved Program Status Register)
     * D=EL1, A=EL1, I=0, F=0, Mode=EL2h
     */
    mov x0, #0x05C9      // SPSR_EL3: D=1, A=1, EL2h, no interrupt masking
    msr spsr_el3, x0
    
    /*
     * Set EL2 entry point
     * Jump to from_el2 with correct registers
     */
    adr x0, from_el2
    msr elr_el3, x0
    
    /*
     * Exception return to EL2
     */
    eret

from_el2:
    /*
     * If coming from EL3, save state
     */
    mov x19, x0          // Preserve x0 value
    
    /*
     * Check if EL2 is available
     * If not, transition to EL1
     */
    mov x0, #0x5C14      // RMR_EL2: Run enable
    mscpr                // MSR rmr_el2, x0 (hyp not available)
    
    /*
     * Configure HCR_EL2 (Hypervisor Configuration Register)
     * Enable virtualization features
     */
    mov x0, #0x80000000  // HCR_EL2: Enable basic virtualization
    msr hcr_el2, x0
    
    /*
     * Set SPSR_EL2 (Saved Program Status Register)
     * D=EL1, A=EL1, I=0, F=0, Mode=EL1h
     */
    mov x0, #0x05C5      // SPSR_EL2: EL1h, interrupts unmasked
    msr spsr_el2, x0
    
    /*
     * Set EL1 entry point
     */
    adr x0, continue_boot
    msr elr_el2, x0
    
    /*
     * Exception return to EL1
     */
    eret

continue_boot:
    /*
     * Begin initialization in EL1
     * Now we can proceed with kernel setup
     */
    
    /*
     * Set up temporary stack
     * This is in the early boot area before MMU is enabled
     * We'll move to proper stack later
     */
    ldr x0, =__stack_bottom
    mov sp, x0
    
    /*
     * Save boot magic for verification
     */
    adr x0, boot_magic
    ldr x1, =0x4F534955  // "FUSI" in little-endian
    str x1, [x0]
    
    /*
     * Mark boot stage: Basic init complete
     */
    mov x0, #BOOT_STAGE_ARCH
    bl set_boot_stage

    /*
     * Zero BSS section
     * This ensures all uninitialized globals start at 0
     */
    ldr x0, =__bss_start
    ldr x1, =__bss_end
    sub x1, x1, x0        // Calculate BSS size
    cbz x1, bss_done      // Skip if BSS is empty
    
bss_zero_loop:
    cbz x1, bss_done      // Exit when done
    str xzr, [x0], #8     // Store zero, advance pointer
    sub x1, x1, #8        // Decrement counter
    b bss_zero_loop

bss_done:
    /*
     * Mark boot stage: BSS zeroed
     */
    mov x0, #BOOT_STAGE_BSS
    bl set_boot_stage

    /*
     * Set up exception vectors for EL1
     * This must be done before enabling interrupts
     */
    bl setup_exception_vectors

    /*
     * Initialize the MMU and caches
     */
    bl mmu_init

    /*
     * Mark boot stage: MMU initialized
     */
    mov x0, #BOOT_STAGE_MMU
    bl set_boot_stage

    /*
     * Jump to C kernel entry
     * This is the main kernel entry point written in C
     */
    bl kernel_main

    /*
     * kernel_main should never return
     * If it does, halt the CPU
     */
kernel_panic_loop:
    wfi                 // Wait for interrupt (low power)
    b kernel_panic_loop

.size start, . - start
.type kernel_main, %function

/*
 * set_boot_stage - Update boot progress
 * 
 * Input: x0 = Boot stage number
 * Clobbers: x0, x1
 */
.global set_boot_stage
.type set_boot_stage, %function
set_boot_stage:
    adr x1, boot_stage
    strb w0, [x1]
    ret

/*
 * setup_exception_vectors - Configure EL1 exception vectors
 * 
 * This sets up the vector table at the standard EL1 vector address.
 * The vectors are 128 bytes each to allow for instruction bundles.
 */
.global setup_exception_vectors
.type setup_exception_vectors, %function
setup_exception_vectors:
    /*
     * VBAR_EL1 is the vector base address register
     * We set it to the location of our vector table
     */
    adr x0, vector_table_el1
    msr vbar_el1, x0
    
    /*
     * Configure SCTLR_EL1 (System Control Register)
     * Enable exceptions and basic MMU features
     */
    mov x0, #SCTLR_INIT
    msr sctlr_el1, x0
    
    ret

/*
 * mmu_init - Initialize the Memory Management Unit
 * 
 * This function:
 *   1. Sets up identity mapping for low memory
 *   2. Creates a linear mapping for kernel memory
 *   3. Enables the MMU with caches enabled
 */
.global mmu_init
.type mmu_init, %function
mmu_init:
    /*
     * Save return address
     */
    stp x29, x30, [sp, #-16]!

    /*
     * x0 = TCR_EL1 (Translation Control Register)
     * Configure for 4KB granules, 48-bit virtual addresses
     */
    mov x0, #TCR_INIT
    msr tcr_el1, x0

    /*
     * Set MAIR_EL1 (Memory Attribute Indirection Register)
     * Configure memory attributes for different types
     */
    ldr x0, =MAIR_ATTRS
    msr mair_el1, x0

    /*
     * Build page tables
     * For a simple identity mapping, we need:
     *   - Level 3 page tables (4KB pages)
     *   - Level 2 tables (covering 2MB each)
     *   - Level 1 table (covering 1GB)
     */
    bl build_page_tables

    /*
     * Set TTBR0_EL1 (Translation Table Base Register 0)
     * Point to our page table base
     */
    ldr x0, =tt_l1_base
    msr ttbr0_el1, x0
    msr ttbr1_el1, x0  // Use same table for both

    /*
     * Enable MMU
     * Set SCTLR.M and SCTLR.C bits
     */
    mrs x0, sctlr_el1
    orr x0, x0, #SCTLR_MMU_ENABLE
    orr x0, x0, #SCTLR_CACHE_ENABLE
    msr sctlr_el1, x0

    /*
     * ISB - Instruction Synchronization Barrier
     * Ensure MMU enable takes effect
     */
    isb

    /*
     * Restore stack and return
     */
    ldp x29, x30, [sp], #16
    ret

/*
 * build_page_tables - Construct translation tables for MMU
 * 
 * This function creates:
 *   - Level 1 table (4KB, 512 entries)
 *   - Level 2 tables for kernel space
 *   - Level 3 tables for page mapping
 */
.global build_page_tables
.type build_page_tables, %function
build_page_tables:
    /*
     * Save registers
     */
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    /*
     * Get page table base
     * This is in the .page_tables section
     */
    ldr x0, =__page_tables_start

    /*
     * Clear Level 1 table (512 entries * 8 bytes = 4KB)
     */
    mov x1, #0
    mov x2, #512
1:  str xzr, [x0], #8
    subs x2, x2, #1
    b.ne 1b

    /*
     * Map first 1GB of physical memory to identity address
     * Level 1 entry points to Level 2 table
     */
    ldr x1, =tt_l2_base     // L2 table base
    orr x1, x1, #0x3        // Table descriptor: valid, table
    str x1, [x0, #0]        // Entry 0: 0x00000000 - 0x40000000

    /*
     * Clear Level 2 table
     */
    mov x2, #512
    ldr x0, =tt_l2_base
2:  str xzr, [x0], #8
    subs x2, x2, #1
    b.ne 2b

    /*
     * Map 2MB pages for identity mapping
     * 512 entries * 2MB = 1GB total
     */
    mov x1, #0              // Physical address
    mov x2, #512            // Number of entries
3:  orr x3, x1, #0x3       // Page descriptor: valid, read/write, page
    str x3, [x0, x1, lsr #21]  // Calculate table index
    add x1, x1, #(2*1024*1024)  // Next 2MB
    subs x2, x2, #1
    b.ne 3b

    /*
     * Restore and return
     */
    ldp x29, x30, [sp], #16
    ret

/*
 * Vector table for EL1 (Synchronous, IRQ, FIQ, SError)
 * Each vector is 128 bytes to allow for instruction bundles
 */
.align 11  // 2048 bytes (128 * 16 vectors)
.global vector_table_el1
.type vector_table_el1, %function
vector_table_el1:

    /*
     * Current EL with SP0 (Synchronous)
     * Used when exception taken to EL1 with SP0
     */
vector_current_el_sp0_sync:
    b vector_current_el_sp0_sync

vector_current_el_sp0_irq:
    b vector_current_el_sp0_irq

vector_current_el_sp0_fiq:
    b vector_current_el_sp0_fiq

vector_current_el_sp0_serror:
    b vector_current_el_sp0_serror

    /*
     * Current EL with SPx (Synchronous)
     * Used when exception taken to EL1 with SPx (SP_EL1)
     */
vector_current_el_spx_sync:
    b vector_current_el_spx_sync

vector_current_el_spx_irq:
    b vector_current_el_spx_irq

vector_current_el_spx_fiq:
    b vector_current_el_spx_fiq

vector_current_el_spx_serror:
    b vector_current_el_spx_serror

    /*
     * Lower EL (aarch64) (Synchronous)
     * Used when exception taken from EL0 to EL1
     */
vector_lower_el_a64_sync:
    b vector_lower_el_a64_sync

vector_lower_el_a64_irq:
    b vector_lower_el_a64_irq

vector_lower_el_a64_fiq:
    b vector_lower_el_a64_fiq

vector_lower_el_a64_serror:
    b vector_lower_el_a64_serror

    /*
     * Lower EL (aarch32) (Synchronous)
     * Used when exception taken from EL0 (aarch32) to EL1
     */
vector_lower_el_a32_sync:
    b vector_lower_el_a32_sync

vector_lower_el_a32_irq:
    b vector_lower_el_a32_irq

vector_lower_el_a32_fiq:
    b vector_lower_el_a32_fiq

vector_lower_el_a32_serror:
    b vector_lower_el_a32_serror

.size mmu_init, . - mmu_init
.size build_page_tables, . - build_page_tables
.size setup_exception_vectors, . - setup_exception_vectors
.size vector_table_el1, . - vector_table_el1

/*
 * Page tables - placed in .page_tables section
 */
.section ".page_tables", "aw"
.align 12  // 4KB alignment

/*
 * Level 1 translation table
 * 512 entries, each covering 1GB of virtual address space
 */
.global tt_l1_base
.type tt_l1_base, %object
tt_l1_base:
    .skip 4096  // Reserve 4KB for L1 table

/*
 * Level 2 translation tables
 * 512 entries, each covering 2MB
 */
.global tt_l2_base
.type tt_l2_base, %object
tt_l2_base:
    .skip 4096  // Reserve 4KB for L2 table

/*
 * Page table for kernel code/data
 */
.global tt_code_base
.type tt_code_base, %object
tt_code_base:
    .skip 4096  // Reserve 4KB

/*
 * Page table for device I/O
 */
.global tt_io_base
.type tt_io_base, %object
tt_io_base:
    .skip 4096  // Reserve 4KB

/*
 * MMU Configuration constants
 */

/*
 * SCTLR_EL1 initialization value
 * System Control Register for EL1
 */
.section ".rodata.mmu", "a"
.global SCTLR_INIT
.type SCTLR_INIT, %object
SCTLR_INIT:
    .quad 0x0000000000000030  // I (instruction cache), SA (stack alignment)
    // Bits:
    // - M: 0 (MMU disabled initially)
    // - A: 0 (no alignment check)
    // - C: 0 (cache disabled initially)
    // - SA: 1 (stack alignment check)
    // - I: 1 (instruction cache)
    // - D: 0 (no WXN)

/*
 * TCR_EL1 initialization value
 * Translation Control Register
 */
.global TCR_INIT
.type TCR_INIT, %object
TCR_INIT:
    .quad 0x000000000000351B  // TCR for 4KB granules, 48-bit VA
    // Bits:
    // - IPS: 0b000 (32-bit physical)
    // - TG1: 0b11 (16KB granule for TTBR1)
    // - SH1: 0b11 (inner shareable)
    // - ORGN1: 0b11 (write-back, read-allocate)
    // - IRGN1: 0b11 (write-back, read-allocate)
    // - EPD1: 1 (disable TTBR1 walks)
    // - T0SZ: 16 (covers 0x0000_0000_0000_0000 to 0xFFFF_FFFF_FFFF)
    // - TG0: 0b00 (4KB granule for TTBR0)
    // - SH0: 0b11 (inner shareable)
    // - ORGN0: 0b11 (write-back, read-allocate)
    // - IRGN0: 0b11 (write-back, read-allocate)
    // - EPD0: 0 (enable TTBR0 walks)
    // - T0SZ: 16

/*
 * MAIR_EL1 memory attributes
 * Memory Attribute Indirection Register
 */
.global MAIR_ATTRS
.type MAIR_ATTRS, %object
MAIR_ATTRS:
    .quad 0x000000000000FF44
    // AttrIdx[2:0] = 000 -> Normal memory, Inner/Outer Write-Back
    // AttrIdx[5:3] = 001 -> Device memory
    // AttrIdx[8:6] = 010 -> Normal memory, Inner/Outer Write-Through
    // AttrIdx[11:9] = 011 -> Normal memory, Inner/Outer Non-Cacheable
    // AttrIdx[14:12] = 100 -> Device memory (nGnRnE)

/*
 * SCTLR bit masks for enabling MMU and caches
 */
.global SCTLR_MMU_ENABLE
.type SCTLR_MMU_ENABLE, %object
SCTLR_MMU_ENABLE:
    .quad 0x0000000000000001  // SCTLR_M

.global SCTLR_CACHE_ENABLE
.type SCTLR_CACHE_ENABLE, %object
SCTLR_CACHE_ENABLE:
    .quad 0x0000000000000004  // SCTLR_C

/*
 * Boot stage constants
 */
.global BOOT_STAGE_ARCH
.type BOOT_STAGE_ARCH, %object
BOOT_STAGE_ARCH:
    .byte 1

.global BOOT_STAGE_BSS
.type BOOT_STAGE_BSS, %object
BOOT_STAGE_BSS:
    .byte 2

.global BOOT_STAGE_MMU
.type BOOT_STAGE_MMU, %object
BOOT_STAGE_MMU:
    .byte 3

.global BOOT_STAGE_KERNEL
.type BOOT_STAGE_KERNEL, %object
BOOT_STAGE_KERNEL:
    .byte 4

/*
 * Kernel panic handler
 */
.global kernel_panic
.type kernel_panic, %function
kernel_panic:
    /*
     * Disable interrupts
     */
    msr daifset, #0xF
    
    /*
     * Halt the CPU
     */
1:  wfi
    b 1b
