/*
 * FusionOS Nexus - ARM64 Boot Stub
 * Entry point and low-level initialization for bare-metal ARMv8-A
 */

#include "kernel.h"

/*
 * ARM64 Exception Levels:
 * EL3: Secure Monitor (TrustZone)
 * EL2: Hypervisor
 * EL1: Kernel
 * EL0: Userland
 *
 * We'll start at EL3 and transition down to EL1
 */

// ARM64 System Registers
#define SCTLR_EL1      s3_0_c1_c0_0
#define SCTLR_EL1_RES0 ((uint64_t)0xfffffffffffc8c24)
#define TCR_EL1        s3_0_c2_c0_2
#define MAIR_EL1       s3_0_c10_c2_0
#define TTBR0_EL1      s3_0_c2_c0_0
#define VBAR_EL1       s3_0_c12_c0_0

// SCTLR bits
#define SCTLR_M        (1 << 0)   // MMU enable
#define SCTLR_A        (1 << 1)   // Alignment check
#define SCTLR_C        (1 << 2)   // Data cache enable
#define SCTLR_I        (1 << 12)  // Instruction cache enable
#define SCTLR_nAA      (1 << 3)   // Non-aliasing for loads/stores

// TCR bits
#define TCR_T0SZ       (0x18)      // Virtual address size for lower half
#define TCR_IRGN0_NC   (0 << 8)   // Inner cacheability for walk
#define TCR_IRGN0_WB   (1 << 8)
#define TCR_ORGN0_NC   (0 << 10)  // Outer cacheability for walk
#define TCR_ORGN0_WB   (1 << 10)
#define TCR_SH0_IS     (0 << 12)  // Shareability for lower half
#define TCR_SH0_NS     (3 << 12)
#define TCR_TG0_4K     (0 << 14)  // Granule size 4KB

// MAIR attributes
#define MAIR_DEVICE_nGnRnE  0x00  // Device, no gathering, no read allocate, no write allocate
#define MAIR_NORMAL_NC      0x44  // Normal, non-cacheable
#define MAIR_NORMAL_WB      0xFF  // Normal, write-back, write-allocate

// Page table constants
#define PAGE_SIZE       0x1000
#define PAGE_SHIFT      12
#define TABLE_SIZE      0x1000

// Kernel virtual base address
#define KERNEL_VIRT_BASE  0xFFFFFFC000000000ULL
#define KERNEL_PHYS_BASE  0x40080000ULL

// Identity mapping region for early boot
#define IDENTITY_MAP_START 0x40000000ULL
#define IDENTITY_MAP_SIZE  0x20000000ULL  // 512MB

.section ".text.boot"
.global _start
.type _start, %function

/*
 * Entry point - called by QEMU or bare metal
 * At this point, we're in EL3 (Secure Monitor mode) on AArch64
 */
_start:
    // Save the arguments passed by firmware (x0 = dtb pointer)
    mov x19, x0
    mov x20, x1
    
    // Initialize all registers to known state
    mov x0, 0
    mov x1, 0
    mov x2, 0
    mov x3, 0
    mov x4, 0
    mov x5, 0
    mov x6, 0
    mov x7, 0
    mov x8, 0
    mov x9, 0
    mov x10, 0
    mov x11, 0
    mov x12, 0
    mov x13, 0
    mov x14, 0
    mov x15, 0
    mov x16, 0
    mov x17, 0
    mov x18, 0
    
    // Zero out BSS section
    ldr x0, =__bss_start
    ldr x1, =__bss_end
    sub x1, x1, x0
    cbz x1, 2f
    mov x2, 0
1:
    str x2, [x0], #8
    subs x1, x1, #8
    b.ne 1b
    
2:
    // Set up exception vectors and stack for EL1
    adr x0, el1_vector_table
    msr vbar_el3, x0
    
    // Enable AArch64 in SCR_EL3 (Secure Configuration Register)
    mov x0, (1 << 0) | (1 << 8)   // NS (Non-secure), HCE (Hypervisor enable)
    msr scr_el3, x0
    
    // Set SPSR_EL3 (Saved Program Status Register)
    mov x0, 0x3C5  // DAIF masked, EL1h, SP_EL1
    msr spsr_el3, x0
    
    // Configure EL2 to EL1 transition
    // Enable 64-bit mode in HCR_EL2
    mov x0, (1 << 31)  // RW (EL1 is AArch64)
    msr hcr_el2, x0
    
    // Disable floating point and SIMD at EL1
    mrs x0, cpacr_el1
    orr x0, x0, #(3 << 20)  // FPEN = 0b11 (disable trapped FP)
    msr cpacr_el1, x0
    
    // Initialize EL1 stack pointer
    ldr x0, =__stack_top
    mov sp, x0
    
    // Set up exception return to EL1
    ldr x0, =kernel_entry
    msr elr_el3, x0
    eret

/*
 * EL1 Entry Point - First C code executed
 * x19 contains DTB pointer, x20 contains boot arguments
 */
.type kernel_entry, %function
kernel_entry:
    // Now running in EL1 with MMU disabled
    
    // Save boot arguments for later use
    mov x20, x0      // dtb pointer in x0
    mov x21, x1      // boot args in x1
    
    // Set up the EL1 exception vectors
    adr x0, el1_vector_table
    msr vbar_el1, x0
    
    // Enable floating point and SIMD
    mrs x0, cpacr_el1
    orr x0, x0, #(3 << 20)
    msr cpacr_el1, x0
    
    // Enable SVE if available (optional)
    // This is a simplified version; full implementation would check ID_AA64PFR0
    
    // Jump to C kernel initialization
    bl kernel_main

/*
 * EL1 Exception Vector Table
 * 16 exception sources x 4 exception levels = 64 entries
 */
.section ".text.vector_table", "ax"
.global el1_vector_table
.type el1_vector_table, %function

el1_vector_table:
    // Current EL with SP_ELx
    .balign 0x200
    el1_sync_sp0:
        b el1_sync_sp0
    .balign 0x200
    el1_irq_sp0:
        b el1_irq_sp0
    .balign 0x200
    el1_fiq_sp0:
        b el1_fiq_sp0
    .balign 0x200
    el1_serror_sp0:
        b el1_serror_sp0
    
    // Current EL with SP_ELx (we use this)
    .balign 0x200
    el1_sync_sp1:
        b el1_sync_synchronous
    .balign 0x200
    el1_irq_sp1:
        b el1_irq_handler
    .balign 0x200
    el1_fiq_sp1:
        b el1_fiq_handler
    .balign 0x200
    el1_serror_sp1:
        b el1_serror_handler
    
    // Lower EL using AArch64
    .balign 0x200
    el1_sync_a64:
        b el1_sync_synchronous
    .balign 0x200
    el1_irq_a64:
        b el1_irq_handler
    .balign 0x200
    el1_fiq_a64:
        b el1_fiq_handler
    .balign 0x200
    el1_serror_a64:
        b el1_serror_handler
    
    // Lower EL using AArch32 (not supported in our kernel)
    .balign 0x200
    el1_sync_a32:
        b .
    .balign 0x200
    el1_irq_a32:
        b .
    .balign 0x200
    el1_fiq_a32:
        b .
    .balign 0x200
    el1_serror_a32:
        b .

/*
 * Exception handlers
 */
.type el1_sync_synchronous, %function
el1_sync_synchronous:
    // Synchronous exception handler
    // Read ESR to determine the exception type
    mrs x0, esr_el1
    mrs x1, far_el1
    // Store exception info and handle it
    bl handle_synchronous_exception
    eret

.type el1_irq_handler, %function
el1_irq_handler:
    // IRQ interrupt handler
    // Save context
    stp x0, x1, [sp, #-16]!
    stp x2, x3, [sp, #-16]!
    stp x4, x5, [sp, #-16]!
    stp x6, x7, [sp, #-16]!
    stp x8, x9, [sp, #-16]!
    stp x10, x11, [sp, #-16]!
    stp x12, x13, [sp, #-16]!
    stp x14, x15, [sp, #-16]!
    stp x16, x17, [sp, #-16]!
    stp x18, x29, [sp, #-16]!
    mov x29, sp
    
    // Call C IRQ handler
    bl handle_irq
    
    // Restore context
    mov sp, x29
    ldp x18, x29, [sp], #16
    ldp x16, x17, [sp], #16
    ldp x14, x15, [sp], #16
    ldp x12, x13, [sp], #16
    ldp x10, x11, [sp], #16
    ldp x8, x9, [sp], #16
    ldp x6, x7, [sp], #16
    ldp x4, x5, [sp], #16
    ldp x2, x3, [sp], #16
    ldp x0, x1, [sp], #16
    eret

.type el1_fiq_handler, %function
el1_fiq_handler:
    // FIQ handler (higher priority IRQ)
    b el1_irq_handler  // For simplicity, handle FIQ same as IRQ

.type el1_serror_handler, %function
el1_serror_handler:
    // SError (System Error) handler
    // This is serious - likely memory access error
    mrs x0, esr_el1
    mrs x1, far_el1
    // Log error and halt
    b print_error_and_halt

.type print_error_and_halt, %function
print_error_and_halt:
    // Print error information and halt
    // This is a placeholder - real implementation would use UART
1:
    wfi
    b 1b

/*
 * Wait for Interrupt / Event helper
 */
.global wait_for_event
.type wait_for_event, %function
wait_for_event:
    wfe
    ret

/*
 * Send Event helper
 */
.global send_event
.type send_for_event, %function
send_event:
    sev
    ret

/*
 * Memory barrier helpers
 */
.global dmb
.type dmb, %function
dmb:
    dmb sy
    ret

.global dsb
.type dsb, %function
dsb:
    dsb sy
    ret

.global isb
.type isb, %function
isb:
    isb
    ret

/*
 * Cache maintenance operations
 */
.global flush_icache_all
.type flush_icache_all, %function
flush_icache_all:
    // Invalidate instruction cache
    ic ivau, x0
    dsb sy
    isb
    ret

.global flush_dcache_all
.type flush_dcache_all, %function
flush_dcache_all:
    // Invalidate data cache
    mrs x0, clidr_el1
    and x1, x0, #0x07000000
    lsr x1, x1, #23
    cbz x1, done
    mov x2, 0
1:
    add x3, x2, x2, lsr #1
    and x3, x3, #0x7
    add x3, x3, x3, lsr #1
    lsl x3, x3, #30
    and x4, x0, x3
    cbz x4, 2f
    lsl x4, x2, #1
    and x5, x4, #0x7F
    add x5, x5, x5, lsr #1
    lsl x5, x5, #3
    mov x4, #0x3FE  // CSSELR level
2:
    msr csselr_el1, x4
    mrs x6, ccsidr_el1
    and x7, x6, #0x7
    add x7, x7, #1
    lsl x9, x7, #5
    and x10, x6, #0x7FF
    lsl x10, x10, #3
    add x10, x10, x9
    and x9, x6, #0xFF8
    lsl x9, x9, #12
    add x10, x10, x9
    add x10, x10, x2, lsl #15
    msr csselr_el1, x4
3:
    sub x10, x10, #0x80
    bics x10, x10, #0x7F
    b.cs 3b
4:
    add x2, x2, #1
    cmp x2, x1
    b.lt 1b
done:
    ret

/*
 * Read/Write system registers
 */
.global read_cntpct_el0
.type read_cntpct_el0, %function
read_cntpct_el0:
    mrs x0, cntpct_el0
    ret

.global read_cntfrq_el0
.type read_cntfrq_el0, %function
read_cntfrq_el0:
    mrs x0, cntfrq_el0
    ret

/*
 * Atomic operations for synchronization primitives
 */
.global atomic_add
.type atomic_add, %function
atomic_add:
    // x0 = address, x1 = value to add
    // Returns new value in x0
1:
    ldxr x2, [x0]
    add x3, x2, x1
    stxr w4, x3, [x0]
    cbnz w4, 1b
    mov x0, x3
    ret

.global atomic_swap
.type atomic_swap, %function
atomic_swap:
    // x0 = address, x1 = new value
    // Returns old value in x0
1:
    ldxr x2, [x0]
    stxr w3, x1, [x0]
    cbnz w3, 1b
    mov x0, x2
    ret

.global atomic_cas
.type atomic_cas, %function
atomic_cas:
    // x0 = address, x1 = old value, x2 = new value
    // Returns success (1) or failure (0) in x0
1:
    ldxr x3, [x0]
    cmp x3, x1
    b.ne 2f
    stxr w4, x2, [x0]
    cbnz w4, 1b
    mov x0, #1
    ret
2:
    mov x0, #0
    ret

/*
 * Spinlock implementation
 */
.global spin_lock
.type spin_lock, %function
spin_lock:
    // Simple test-and-set spinlock
    mov w1, #1
1:
    ldxr w2, [x0]
    cbnz w2, 1b
    stxr w3, w1, [x0]
    cbnz w3, 1b
    dmb sy
    ret

.global spin_unlock
.type spin_unlock, %function
spin_unlock:
    dmb sy
    mov w1, #0
    str w1, [x0]
    // Send event to wake waiting CPUs
    sev
    ret

/*
 * Timer setup for scheduler
 */
.global setup_timer
.type setup_timer, %function
setup_timer:
    // Enable timer at EL1
    mrs x0, cntkctl_el1
    orr x0, x0, #1  // Enable EL0 access to timer
    msr cntkctl_el1, x0
    
    // Set timer value (example: 10ms interval)
    mrs x0, cntfrq_el0
    lsr x0, x0, #6  // Approximate 10ms at typical 100MHz
    msr cntp_tval_el0, x0
    
    // Enable timer
    mrs x0, cntp_ctl_el0
    orr x0, x0, #1
    msr cntp_ctl_el0, x0
    ret

/*
 * Interrupt enable/disable
 */
.global enable_irqs
.type enable_irqs, %function
enable_irqs:
    msr daifclr, #0x2
    ret

.global disable_irqs
.type disable_irqs, %function
disable_irqs:
    msr daifset, #0x2
    ret

.global save_and_disable_irqs
.type save_and_disable_irqs, %function
save_and_disable_irqs:
    mrs x0, daif
    msr daifset, #0x2
    ret
