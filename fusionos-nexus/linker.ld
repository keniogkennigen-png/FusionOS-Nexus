/*
 * FusionOS Nexus - Linker Script
 * 
 * This script controls how the linker places sections in the final kernel image.
 * Memory layout designed for ARM64 (AArch64) bare-metal execution.
 * 
 * Memory Map:
 *   - Text (Code):    0x00000000 - 0x00100000 (1 MB)
 *   - Data:           0x00100000 - 0x00200000 (1 MB)
 *   - BSS:            0x00200000 - 0x00300000 (1 MB)
 *   - Heap:           0x00300000 - 0x00700000 (4 MB)
 *   - Stack:          Grows downward from 0x00800000
 *   - Page Tables:    0x00800000 - 0x00C00000 (4 MB)
 * 
 * Notes:
 *   - Designed for MMU enabled operation with 4KB pages
 *   - Position independent code (PIC) support
 *   - Boot jump stub at fixed low address (0x40000000 in physical)
 */

OUTPUT_FORMAT("elf64-littleaarch64", "elf64-bigaarch64", "elf64-littleaarch64")
OUTPUT_ARCH(aarch64)

/*
 * Kernel identity - used for version information
 */
KERNEL_NAME = "FusionOS Nexus";
KERNEL_VERSION = "1.0.0";
KERNEL_BUILD_DATE = "2026-01-19";

/*
 * Entry point - where execution begins after boot
 */
ENTRY(start)

/*
 * Base addresses
 */
BASE_TEXT = 0x00000000;
BASE_DATA = 0x00100000;
BASE_BSS  = 0x00200000;
BASE_HEAP = 0x00300000;
BASE_STACK = 0x00800000;

/*
 * Section sizes
 */
TEXT_SIZE = 1M;
DATA_SIZE = 1M;
BSS_SIZE  = 1M;
HEAP_SIZE = 4M;
STACK_SIZE = 1M;

/*
 * Total kernel footprint
 */
KERNEL_MIN_SIZE = TEXT_SIZE + DATA_SIZE + BSS_SIZE;

/*
 * Memory regions
 * These correspond to physical memory regions on the target platform
 */
MEMORY
{
    /*
     * Code and read-only data - execute enabled
     * Position: 0x0 (mapped to 0x40000000 in MMU)
     */
    text (rx) : ORIGIN = BASE_TEXT, LENGTH = TEXT_SIZE
    
    /*
     * Read-write data - initialized data segment
     */
    data (rwx) : ORIGIN = BASE_DATA, LENGTH = DATA_SIZE
    
    /*
     * BSS segment - uninitialized data (zeroed at startup)
     */
    bss (rw) : ORIGIN = BASE_BSS, LENGTH = BSS_SIZE
    
    /*
     * Page tables - for MMU identity mapping
     * Level 1, 2, 3 page tables for 4KB pages
     */
    page_tables (rw) : ORIGIN = BASE_STACK - 4M, LENGTH = 4M
}

/*
 * SECTIONS directive - defines section placement
 */
SECTIONS
{
    /*
     * Boot jump stub section
     * Must be at very beginning of image for bootrom to find
     */
    .boot : ALIGN(4K)
    {
        __boot_start = .;
        *(.boot*)
        __boot_end = .;
    } >text

    /*
     * Text section - executable code
     * Read-only, execute-enabled
     */
    .text : ALIGN(4K)
    {
        __text_start = .;
        
        /*
         * Interrupt vector table - must be at 0x0 in ARM64
         * This is mapped to the text section base
         */
        . = ALIGN(128);
        *(.vector_table*)
        
        /*
         * Text headers and metadata
         */
        . = ALIGN(4K);
        *(.text.header*)
        
        /*
         * Core kernel code
         */
        . = ALIGN(4K);
        *(.text*)
        
        /*
         * Read-only data in text section
         */
        *(.rodata*)
        
        /*
         * Exception handling data
         */
        . = ALIGN(4K);
        *(.eh_frame*)
        *(.gcc_except_table*)
        
        __text_end = .;
    } >text

    /*
     * Data section - initialized read-write data
     * Loaded from ROM, copied to RAM at startup
     */
    .data : ALIGN(4K)
    {
        __data_start = .;
        
        /*
         * Small data (GOT and global data < 8 bytes)
         */
        *(.sdata*)
        
        /*
         * Global initialized data
         */
        *(.data*)
        
        /*
         * Thread-local storage
         */
        . = ALIGN(8);
        *(.tdata*)
        *(.tbss*)
        
        __data_end = .;
    } >data

    /*
     * BSS section - uninitialized global data
     * Zeroed by kernel initialization
     */
    .bss : ALIGN(4K)
    {
        __bss_start = .;
        
        /*
         * Small BSS
         */
        *(.sbss*)
        
        /*
         * Regular BSS
         */
        *(.bss*)
        
        /*
         * Common symbols
         */
        . = ALIGN(4K);
        *(.comm*)
        
        __bss_end = .;
    } >bss

    /*
     * Heap section - dynamic memory allocation
     * Managed by the kernel heap allocator
     */
    .heap : ALIGN(4K)
    {
        __heap_start = .;
        . += HEAP_SIZE;
        __heap_end = .;
    } >data

    /*
     * Page table section - MMU translation tables
     * Aligned to 4KB boundary for page table requirements
     */
    .page_tables : ALIGN(4K)
    {
        __page_tables_start = .;
        *(.page_tables*)
        *(.ttb*)
        *(.ttbr*)
        __page_tables_end = .;
    } >page_tables

    /*
     * Stack section - grows downward
     * Placed at top of available memory
     */
    .stack (NOLOAD) : ALIGN(4K)
    {
        __stack_top = .;
        . += STACK_SIZE;
        __stack_bottom = .;
    } >page_tables

    /*
     * Discard sections - not needed in final image
     */
    /DISCARD/ :
    {
        *(.comment*)
        *(.note*)
        *(.note.gnu.build-id*)
        *(.ARM.attributes*)
    }

    /*
     * Symbol definitions for external access
     */
    /*
     * Kernel symbols - exported for boot code
     */
    __kernel_start = ADDR(.text) + SIZEOF(.text);
    __kernel_end = __bss_start + SIZEOF(.bss);
    
    /*
     * Image boundaries
     */
    _image_start = __boot_start;
    _image_end = __stack_bottom;
    _image_size = _image_end - _image_start;

    /*
     * Memory layout summary (loaded as symbols)
     */
    __mem_text_base = BASE_TEXT;
    __mem_data_base = BASE_DATA;
    __mem_bss_base = BASE_BSS;
    __mem_heap_base = BASE_HEAP;
    __mem_stack_base = BASE_STACK;

    /*
     * Profiling and debug info
     */
    _etext = __text_end;
    _edata = __data_end;
    _end = __bss_end;
}
