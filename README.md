// V08         
// 7 SEG Device - two DMA
//$DEV SEVEN-SEGMENT-D 10 4 1
_SEG_BASE_IRQ1   EQU   10   
ORG   1000   
FREE   RESBOX   500   
STACK_BOTTOM   EQU   $   
ORG   2000   
// 7 SEG Fonts for numeric characters in ASCII code order
FONTS_TABLE:      // Fonts   ASCII Code in Decimal
BOX   0b00111111   // 48 0
BOX   0b00000110   // 49 1
BOX   0b01011011   // 50 2
BOX   0b01001111   // 51 3 
BOX   0b01100110   // 52 4
BOX   0b01101101   // 53 5
BOX   0b01111101   // 54 6 
BOX   0b00000111   // 55 7
BOX   0b01111111   // 56 8
BOX   0b01101111   // 57 9
BOX   0b01000000   // 58 -
BOX 0b00000000  // 59 blank
TABLE_END:         
TABLE_LENGTH   EQU   TABLE_END - FONTS_TABLE
ORG   0   
RUNTIME:         
   INTOFF      
   LD   A, =STACK_BOTTOM   
   MOV   SP, A   
   LD   A, #1   
   MOV   D0, A   
   SETRTN3      
   PUSH   RTN   
   JMP   _KNL_DMAINIT   
   CLR   C   
   CMP   A, C   
   SKZ      
   JMP   FAIL_RUN   
   SETRTN3      
   PUSH   RTN   
   JMP   MAIN   
FAIL_RUN:         
   IDLE   COB      
   JMP    IDLE   
MMIO_BASE   BOX   U(9900)   
DEVICE_TBL:         
   BOX   0   
   BOX   _SEG_BASE_IRQ1   
// 7 세그먼트 장치의 레지스터 주소 (IO Address)
   _SEG_DATA   EQU   0   
   _SEG_ADDR   EQU   1   
   _SEG_CMD   EQU   2   
   _SEG_STATE   EQU   3   
   _SEG_DMACMD   EQU   4   
   _SEG_DMAOFF   EQU   5   
   _SEG_DMASRC   EQU   6   
   _SEG_DMACNT   EQU   7   
// Command for 7SEG Device
   SEG_WRITE_AA   BOX   100   
   SEG_LIGHT_AA   BOX   200   
   SEG_OFF_AA   BOX   300   
   SEG_READ_AA   BOX   400   
   SEG_WRITE   BOX   981   
   SEG_LIGHT   BOX   982   
   SEG_READ_LIGHT   BOX   983   
   SEG_READ   BOX   984   
   SEG_LIGHTALL   BOX   992   
   SEG_OFFALL   BOX   993   
   SEG_RESET   BOX   999   
   SEG_DMAWRITE   BOX   991   
_KNL_DMAWRITE:         
// 매개변수      
// D0: 장치번호   
// D1: 버퍼주소   
// D2: 반복횟수   
// 반환값      
// 없음   
   LD   A, MMIO_BASE   
   MOV   B, A   
   LD   A, =DEVICE_TBL   
   ADD   A, D0   
   LD   A, *A   
   MOV   X, A   
   MOV   A, D1   
   ST   A, @%_SEG_DMASRC   
   MOV   A, D2   
   ST   A, @%_SEG_DMACNT   
   MOV   A, SEG_DMAWRITE   
   ST   A, @%_SEG_CMD   
   POP   RTN   
   JMP   *RTN   
_KNL_DMAREADY:         
// 매개변수      
// D0: 장치번호   
// 반환값      
// A: 0-성공, 1-실패   
   LD   A, MMIO_BASE   
   MOV   B, A   
   LD   A,=0001   
   MOV   C, A   
// 장치가 준비 상태인지 확인.
   LD   A, =DEVICE_TBL   
   ADD   A, D0   
   LD   A, *A   
   MOV   X, A   
_POLLING:         
   LD   A, @%_SEG_STATE   
   AND   A, C   
   SKNE      
   JMP   _POLLING   
   CLR   A   
   POP    RTN   
   JMP   *RTN   
_KNL_DMAINIT:         
// 매개변수      
// D0: 장치번호   
// 반환값      
// A: 0-성공, 1-실패   
   LD   A, MMIO_BASE   
   MOV   B, A   
   LD   A,=0001   
   MOV   C, A   
   // 장치가 준비 상태인지 확인.
   LD   A, =DEVICE_TBL   
   ADD   A, D0   
   LD   A, *A   
   MOV   X, A   
_INIT_POLLING:         
   LD   A, @%_SEG_STATE   
   AND   A, C   
   SKNE      
   JMP   _INIT_POLLING   
   LD   A, SEG_LIGHTALL   
   ST   A, @%_SEG_CMD   
   CLR   A   
   POP   RTN   
   JMP   *RTN   
HEAP   BOX   FREE   
TINY_ALLOC:         
// 매개변수      
// A: size   
// 반환값      
// A: 할당된 메모리의 시작 주소
   MOV   B, A   
   LD   A, HEAP   
   MOV   C, A   
   ADD   A, B   
   ST   A, HEAP   
   MOV   A, C   
   POP   RTN   
   JMP   *RTN   
PRINT_7SEG:         
// 매개변수      
// D0: 장치번호+Offset   
// D1: 메세지주소   
// D2: 메세지크기   
// 반환값      
// 없음   
   LD   A, D2   
   ADD   A, A   
   ADD   A, D2
    INC D1
   SETRTN3      
   PUSH   RTN   
   JMP   TINY_ALLOC   
SNAP1:         
   MOV   B, A   
   CLR   X   
DO_WHILE_1:         
   CMP   X, D2   
   SKN      
   JMP   END_WHILE_1   
   LD   A, ="0"   
SNAP2:         
   NEG   A    
   MOV   C, A   
   LD   A, @*D1   
SNAP3:         
   ADD   C, A   
   SWAP   X, C   
SNAP4:         
   LD   A, =FONTS_TABLE   
   LD   A, @*A   
   MOV   X, C   
   ADD   X, X   
   ADD   X, C   
   ST   A, @%0   
SNAP5:         
   LD   A, C   
   ADD   A, D0   
SNAP6:         
   SHL   A, 1   
   SHR   A, 1   
SNAP7:         
   ST   A, @%1   
   LD   A, SEG_WRITE   
   ST   A, @%2   
   MOV   X, C   
SNAP8:         
   INC   X   
   JMP   DO_WHILE_1   
END_WHILE_1:         
   MOV   A, D0   
   SHR   A, 3   
   MOV   D0, A   
   MOV   D1, B   
   MOV   D2, X   
SNAP9:         
   SETRTN3      
   PUSH   RTN   
   JMP   _KNL_DMAREADY   
   CLR   C   
   CMP   A, C    
   SKZ      
   JMP   FAIL_PRINT   
   SETRTN3      
   PUSH   RTN   
   JMP   _KNL_DMAWRITE   
FAIL_PRINT:         
   POP   RTN   
   JMP   *RTN   
MAIN:         
   LD   A, =1000   
   MOV   D0, A   
   PUSH B
   LD   A, P_MSG1
   MOV   D1, A   
   MOV B,A
   IN 
   ROL A,1
   PUSH A
   SHR A, 3
   DEC A
   DEC A
   DEC A
   DEC A
   PUSH RTN
   SETRTN4
   SKP
   JMP PLUS
   JMP MINUS
   POP B
   SWAP D3,RTN
   LD   A, #4   
   MOV   D2, A   
   SETRTN3         
   PUSH   RTN
   JMP   PRINT_7SEG   
   POP   RTN   
   JMP   *RTN   
   
PLUS:
   LD A,TEMP3 // blank을 의미함
   ST A,%1
    SWAP D3,RTN
    POP RTN
    POP A
    PUSH A
    SHR A,3
    PUSH B
    MOV B,A
    LD A,TEMP1
    ADD A,B
    POP B
    ST A,%2
   POP A
   
    ROL A,1
    PUSH A
    SHR A,3
    PUSH B
    MOV B,A
    LD A,TEMP1
    ADD A,B
    POP B
   ST A,%3
    POP A
    
    ROL A,1
    PUSH A
   ROL A,1
    SHR A,3
    PUSH B
    MOV B,A
    LD A,TEMP1
    ADD A,B
    POP B
    ST A,%4
   
    SWAP D3,RTN
    JMP *RTN

MINUS:

   LD A,TEMP2 // -을 의미함
   ST A,%1
    SWAP D3,RTN
    POP RTN
    POP A
    NEG A
    PUSH A
    SHR A,3
    PUSH B
    MOV B,A
    LD A,TEMP1
    ADD A,B
    POP B
    ST A,%2
   POP A
   
    ROL A,1
    PUSH A
    SHR A,3
    PUSH B
    MOV B,A
    LD A,TEMP1
    ADD A,B
    POP B
   ST A,%3
    POP A
    
    ROL A,1
    PUSH A
   ROL A,1
    SHR A,3
    PUSH B
    MOV B,A
    LD A,TEMP1
    ADD A,B
    POP B
    ST A,%4
   
    SWAP D3,RTN
    JMP *RTN
    
P_MSG1   RESBOX 4   
TEMP1 BOX 48
TEMP2 BOX 58
TEMP3 BOX 59
