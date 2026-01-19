/*
 * FusionOS Nexus - Memory Layout and Linking Script
 * Defines the memory map for ARM64 bare-metal kernel
 */

OUTPUT_FORMAT("elf64-littleaarch64")
OUTPUT_ARCH(aarch64)
ENTRY(_start)

/*
 * Memory Layout:
 * - Kernel is loaded at physical address 0x40080000
 * - Kernel virtual base: 0xFFFFFFC000000000
 * - Total kernel size: ~2MB (including boot, text, data, bss, stack, heap)
 */

/* Kernel load address and size constraints */
phys_base = 0x40080000;
kernel_virt_base = 0xFFFFFFC000000000;

/* Stack configuration */
stack_size = 0x10000;          /* 64KB primary stack */
interrupt_stack_size = 0x4000; /* 16KB interrupt stack per CPU */

/* Heap configuration */
heap_start = 0x40200000;
heap_end = 0x41C00000;         /* 28MB heap */

/* Virtual memory region for kernel mappings */
vmem_start = 0xFFFFFFC000000000;
vmem_end = 0xFFFFFFC080000000; /* 2GB kernel virtual space */

/* Calculate section offsets */
text_start = phys_base;
rodata_start = ALIGN(text_start + SIZEOF(.text), 4096);
data_start = ALIGN(rodata_start + SIZEOF(.rodata), 4096);
bss_start = ALIGN(data_start + SIZEOF(.data), 4096);
bss_end = bss_start + SIZEOF(.bss);
sbss_start = ALIGN(bss_start, 8);
sbss_end = sbss_start + SIZEOF(.sbss);

/* Bootstrap stack and early page table location */
boot_stack_top = 0x41000000;
boot_page_table = 0x41010000;

/* Per-CPU data */
percpu_start = 0x41020000;
percpu_size = 0x1000; /* 4KB per CPU */

/*
 * Memory map for different types:
 * - Normal RAM: For .text, .rodata, .data, .bss
 * - Device memory: For device MMIO (not directly mapped here)
 */

/*
 * SECTIONS definition
 */
SECTIONS
{
    /*
     * Boot section - must be first for boot stub
     */
    . = phys_base;
    
    .boot : {
        *(.text.boot)
        *(.text.vector_table)
    } = 0xFF
    
    /*
     * Text section - executable code
     */
    .text : {
        *(.text)
        *(.text.*)
        . = ALIGN(8);
        _etext = .;
    } = 0xFF
    
    /*
     * Read-only data - constants, strings, etc.
     */
    .rodata : {
        *(.rodata)
        *(.rodata.*)
        . = ALIGN(8);
        _erodata = .;
    }
    
    /*
     * Data section - initialized read-write data
     */
    . = data_start;
    _data_start = .;
    
    .data : {
        *(.data)
        *(.data.*)
        . = ALIGN(8);
        _data_end = .;
    }
    
    /*
     * Small data section - for small global variables
     */
    .sdata : {
        *(.sdata)
        *(.sdata.*)
        . = ALIGN(8);
    }
    
    /*
     * BSS section - uninitialized data
     */
    . = bss_start;
    _bss_start = .;
    
    .bss : {
        *(.bss)
        *(.bss.*)
        *(COMMON)
        . = ALIGN(8);
        _bss_end = .;
    }
    
    .sbss : {
        *(.sbss)
        *(.sbss.*)
        . = ALIGN(8);
        _sbss_end = .;
    }
    
    /*
     * Page table section - early page tables
     */
    .page_tables : {
        *(.page_tables)
        . = ALIGN(4096);
    }
    
    /*
     * Per-CPU data section
     */
    .percpu : {
        *(.percpu)
        . = ALIGN(4096);
    }
    
    /*
     * Stack sections
     */
    .stack (NOLOAD) : {
        _stack_start = .;
        . += stack_size;
        __stack_top = .;
        . = ALIGN(4096);
    }
    
    .interrupt_stack (NOLOAD) : {
        __interrupt_stack_start = .;
        . += interrupt_stack_size;
        . = ALIGN(4096);
        __interrupt_stack_top = .;
    }
    
    /*
     * Exception stack for each CPU (SMP support)
     */
    .cpu0_stack (NOLOAD) : {
        __cpu0_stack_start = .;
        . += interrupt_stack_size;
        __cpu0_stack_top = .;
        . = ALIGN(4096);
    }
    
    /*
     * Heap section (for dynamic allocation)
     */
    .heap (NOLOAD) : {
        __heap_start = .;
        . = heap_end;
        __heap_end = .;
    }
    
    /*
     * Symbol for end of kernel image
     */
    _end = .;
    __end = .;
    
    /*
     * Discard non-allocated sections
     */
    /DISCARD/ : {
        *(.comment)
        *(.note.*)
        *(.debug*)
    }
}

/*
 * Symbol exports for the kernel
 */
PROVIDE(_start = phys_base);
PROVIDE(__bss_start = _bss_start);
PROVIDE(__bss_end = _bss_end);
PROVIDE(__stack_top = __stack_top);
