// Shadertoy URL: https://www.shadertoy.com/view/4dlyWX

// Update Logic for Commodore 64 by hubbe
// https://www.shadertoy.com/view/Xs3XW4

// TODO: break

#define CURSOR 0
#define STATE 1
#define MEMORY 2

vec4 old_memory[MEMORY];
vec4 memory[MEMORY];

#define STATE_READY 0
#define STATE_PRINT_READY 1
#define STATE_PRINT_READY_NL 2
#define STATE_LISTING 3
#define STATE_RUNNING 4
#define STATE_BREAK 5

#define LINE_ZERO 30
#define MAX_LINES 200

float vec4pick(int c, vec4 v) {
    if (c == 0) return v.x;
    if (c == 1) return v.y;
    if (c == 2) return v.z;
    return v.w;
}

int vec4toint(int c, vec4 v) {
    c = int(mod(float(c), 8.0));
    float tmp = vec4pick(c / 2, v);
    if (c != (c/2) * 2) {
        return int(mod(tmp, 256.0));
    } else {
        return int(tmp) / 256;
    }
}

vec4 vec4tochar(int c, vec4 v) {
    return vec4(vec4toint(c, v), 14/* fg */, 6 /* bg */, 0);
}


void init_screen(out vec4 fragColor, int x, int y) {
    fragColor = vec4(96, 14, 6, 0);

    if(y == 1) {
        if (x > 3 && x < 35) fragColor.x = 42.0;
        if (x > 7 && x < 31) fragColor.x = 96.0;
        x -= 9;
        vec4 tmp;
        if (x < 0) return;
        if (x > 20) return;
        int n = x / 8;
        if (n == 0) tmp = vec4(0x030F, 0x0D0D, 0x0F04, 0x0F12);  // COMMODOR
        if (n == 1) tmp = vec4(0x0560, 0x3634, 0x6002, 0x0113);  // E 64 BAS
        if (n == 2) tmp = vec4(0x0903, 0x6016, 0x3200, 0x0000);  // IC V2
        fragColor = vec4tochar(x, tmp);
    }
    if (y == 3) {
        int n = x / 8;
        vec4 tmp;
        if (n == 0) tmp = vec4(0x6036, 0x340B, 0x6012, 0x010D); //  64K RAM
        if (n == 1) tmp = vec4(0x6013, 0x1913, 0x1405, 0x0D60); //  SYSTEM 
        if (n == 2) tmp = vec4(0x6033, 0x3839, 0x3131, 0x6002); //  38911 B
        if (n == 3) tmp = vec4(0x0113, 0x0903, 0x6002, 0x1914); // ASIC BYT
        if (n == 4) tmp = vec4(0x0513, 0x6006, 0x1205, 0x0560); // ES FREE
        fragColor = vec4tochar(x, tmp);
    }
}

int key = -1;
int scroll = 0;

void NL() {
   memory[CURSOR].x = 0.0;
   memory[CURSOR].y += 1.0;
   if (memory[CURSOR].y >= 20.0) {
       scroll += 1;
       memory[CURSOR].y -= 1.0;
   }
}

void putc(int c) {
    key = c;
    memory[CURSOR].x += 1.0;
    if (memory[CURSOR].x > 40.0) NL();
}

int screen_pos(vec4 v) {
    int x = int(v.x + 0.5);
    int y = int(v.y + 0.5);
    return x + y * 40;
}

vec4 peek(int x, int y) {
    return texelFetch(iChannel0, ivec2(x, y), 0 );
}

vec4 peek(int pos) {
    int y = pos / 40;
    int x = pos - y * 40;
    return peek(x, y);
}

vec4 itoa(int x, int p) {
	int c = 96;
    int len = 1;
    if (x > 9) len = 2;
    if (x > 99) len = 3;
    if (p < len) {
        int power10 = 1;
        if (len - p == 2) power10 = 10;
        if (len - p == 3) power10 = 100;
        c = 48 + int(mod(float(x / power10), 10.0));        
    }
    return vec4(c, 14, 6, 0);
}

int copy_from;
int copy_to;
int copy_length;

#define MSG_SYNTAX_ERROR -1
#define MSG_READY -2
#define MSG_ZERO -3
#define MSG_BREAK -4

void copy(int pos, inout vec4 tmp) {
    int c = pos - copy_to;
    if (c >= 0 && c < copy_length) {
        tmp = vec4(0,0,0,0);
        if (copy_from == MSG_SYNTAX_ERROR) {
            vec4 ch;
            if (c / 8 == 0)
              ch = vec4(0x3F13, 0x190E, 0x1401, 0x1860);  // ?SYNTAX 
            if (c / 8 == 1)
              ch = vec4(0x6005, 0x1212, 0x0F12, 0x0000);  // ERROR
            tmp = vec4tochar(c, ch);
        } else if (copy_from == MSG_READY) {
            vec4 ch = vec4(0x1205, 0x0104, 0x192E, 0);
            tmp = vec4tochar(c, ch) ; 
        } else if (copy_from == MSG_ZERO) {
            tmp = vec4(0);
        } else if (copy_from == MSG_BREAK) {
            vec4 ch;
            if (c < 8)
              tmp = vec4tochar(c, vec4(0x0212, 0x0501, 0x0B60, 0x090E));  // BREAK IN
            if (c == 8)
              tmp = vec4(96, 14, 6, 0);
            if (c > 8)
              tmp = itoa(int(memory[STATE].y), c - 9);
        } else {
	        tmp = peek(copy_from + c);
            if (tmp.x >= 128.0) tmp.x -= 128.0;
        }
    }
}

void memcpy(int dst, int src, int len) {
    copy_from = src;
    copy_to = dst;
    copy_length = len;
}


void print(int msg, int msg_len) {
    NL();
    memcpy(screen_pos(memory[CURSOR]) - 40, msg, msg_len);
}

void list() {
      memory[STATE].x = float(STATE_LISTING);
      memory[STATE].y = float(0);
}

int getchar(int x, int y) {
    int c = int(peek(x, y).x);
    if (c > 128) c -= 128;
    return c;
}

int getchar(int pos) {
    int c = int(peek(pos).x);
    if (c > 128) c -= 128;
    return c;
}

void skipwhite(inout int pos) {
    int c = getchar(pos);
    if (c == 96) pos = pos + 1;    
    c = getchar(pos);
    if (c == 96) pos = pos + 1;    
    c = getchar(pos);
    if (c == 96) pos = pos + 1;    
}

bool strtod(inout int pos, inout int value) {
  skipwhite(pos);
  int c = getchar(pos);
  int num = c - 48;
  if (num < 0 || num > 9) return false;
  value = num;
  pos = pos + 1;
  c = getchar(pos);
  num = c - 48;
  if (num < 0 || num > 9) return true;
  value = value * 10 + num;
  pos = pos + 1;
  c = getchar(pos);
  num = c - 48;
  if (num < 0 || num > 9) return true;
  value = value * 10 + num;
  return true;  
}

void skipnum(inout int pos) {
    int value;
    strtod(pos, value);
}

void parse(int pos) {
    skipwhite(pos);
    int c1 = getchar(pos);
    int c2 = getchar(pos + 1);
    int c3 = getchar(pos + 2);
    int c4 = getchar(pos + 3);
    if (c1 == 12 && c2 == 9 && c3 == 19 && c4 == 20) { // list
        list();
        
    } else if (c1 == 18 && c2 == 21 && c3 == 14) { // run
        memory[STATE].x = float(STATE_RUNNING);
        int line = 0;
        int p = pos + 3;
        strtod(p, line);
        memory[STATE].y = float(line);
    } else if (c1 == 7 && c2 == 15 && c3 == 20 && c2 == 15) { // goto
        memory[STATE].x = float(STATE_RUNNING);
        int line = 0;
        int p = pos + 4;
        strtod(p, line);
        memory[STATE].y = float(line);
    } else if (c1 == 16 && c2 == 18 && c3 == 9 && c4 == 14) {
        // print
        NL();
        int p = pos + 7;
        int len = 0;
        for (int l = 0; l < 33; l++) {
            if (len == 0 && int(peek(p + l).x) == 34)
                len = l;
        }
        
        memcpy(screen_pos(memory[CURSOR]) - 40, pos + 7, len);
    } else if (c1 == 96 && c2 == 96 && c3 == 96 && c4 == 96) {
        // Do nothing
    } else {
        int value = 0;
        int p = pos;
        if (strtod(p, value)) {
            if (getchar(p) == 96 && getchar(p+1) == 96 && getchar(p+2) == 96) {
				memcpy((LINE_ZERO + value) * 40, MSG_ZERO, 10);
            } else {
	          memcpy((LINE_ZERO + value) * 40, pos, 40);
            }
        } else {
          NL();
          NL();
          // ?SYNTAX ERROR
          memcpy(screen_pos(memory[CURSOR]) - 40, MSG_SYNTAX_ERROR, 14);
          memory[STATE].x = float(STATE_PRINT_READY);
        }
    }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    copy_length = 0;
	int x = int(fragCoord.x);
    int y = int(fragCoord.y);
    if (x > 40 && y > 25) discard;
    
    if (iFrame < 3) {
    	memory[CURSOR] = vec4(0, 5, 0, 0);
        memory[STATE].x = float(STATE_PRINT_READY);
    } else {
	    for (int i = 0; i < MEMORY; i++) {
    		memory[i] = peek(i + 40, 0);
            old_memory[i] = memory[i];
   		}
    } 

    fragColor = peek(x, y);

    if (memory[STATE].x == float(STATE_LISTING)) {
        int line = int(memory[STATE].y);
        memory[STATE].x = float(STATE_PRINT_READY_NL);
        
        for (int i = 0; i < 50; i++) {
            if (getchar(0, LINE_ZERO + line + i) != 0) {
                memory[STATE].x = float(STATE_LISTING);
                memory[STATE].y = float(line + i + 1);
                NL();
                memcpy(screen_pos(memory[CURSOR]) - 40, 40 * (LINE_ZERO + line + i), 40);
                break;
            }
        }
    } else if (memory[STATE].x == float(STATE_RUNNING)) {
        bool esc = texture(iChannel1, vec2(27.5 / 256.0, 0.5/3.0)).x > 0.5;
        if (esc) {
            NL();
            memory[STATE].x = float(STATE_BREAK);
        } else {
           	int line = int(memory[STATE].y);
	        memory[STATE].x = float(STATE_PRINT_READY_NL);
        
    	    for (int i = 0; i < 50; i++) {
        	    if (getchar(0, LINE_ZERO + line + i) != 0) {
            	    memory[STATE].x = float(STATE_RUNNING);
                	memory[STATE].y = float(line + i + 1);
    	            int pos = 40 * (LINE_ZERO + line + i);
	                skipnum(pos);
        	        parse(pos);
            	    break;
        	    }
     	   }
        }
    } else if (memory[STATE].x == float(STATE_BREAK)) {
  		memory[STATE].x = float(STATE_PRINT_READY);
        print(MSG_BREAK, 12);
    } else if (memory[STATE].x == float(STATE_PRINT_READY)) {
  		memory[STATE].x = float(STATE_READY);
        print(MSG_READY, 6);
    } else if (memory[STATE].x == float(STATE_PRINT_READY_NL)) {
  		memory[STATE].x = float(STATE_READY);
        NL();
        print(MSG_READY, 6);
    } else {
 	   bool shift = texture(iChannel1, vec2(16.5 / 256.0, 0.5/3.0)).x > 0.5;

    	for (int key = 0; key < 64; key++) {
        	float key_val = texture(iChannel1, vec2((float(key) + 32.5)/256.0, 0.5)).x;
	        if (key_val > 0.6) {
    	        if (key > 32)
        	        putc(key - 32 + (shift ? 64 : 0));
            	else if (key == 0)
                	putc(96);
	            else if (key >= 16)
    	            putc(key + 32 + (shift ? -16 : 0));
        	}
 	   }
    
  	  if (texture(iChannel1, vec2(13.5/256.0, 0.5)).x > 0.6) {
          int y = int(memory[CURSOR].y);
    	    NL();
     	   parse(y * 40);
  	      // Enter
  	  }
        if (texture(iChannel1, vec2(8.5/256.0, 0.5)).x > 0.6) {
            int x = int(memory[CURSOR].x);
            if (x > 0) {
                x = x - 1;
                int p = screen_pos(memory[CURSOR]);
                memcpy(p - 1, p, 40 - x);
                memory[CURSOR].x = float(x);
            }
        }
    }
     
    if (x >= 0 && x < 40 && y >=0 && y < 20) {
      if (iFrame < 2) {
        init_screen(fragColor, x, y);
        return;
      }
      fragColor = peek(x, y + scroll);
      int sp = x + y * 40;
      
      if (sp + 40 * scroll == screen_pos(old_memory[CURSOR])) {
          fragColor.x = mod(fragColor.x, 128.0);
          if (key != -1)
          {
              fragColor.x = float(key);
          }
      }

      if (sp == screen_pos(memory[CURSOR])) {
          if (fract(iTime) > 0.5) {
            fragColor.x += 128.0;
         }
      }
      copy(sp, fragColor);
      return;
    }
    copy(x + y * 40, fragColor);
    if (x >= 0 && x < 40 && y >= 20 && y <= 25) {
       fragColor = vec4(96, 14, 6, 0);
    }
    if (y == 0) {
 		for (int i = 0; i < MEMORY; i++) {
 	    	if (i + 40 == x) {
				fragColor = memory[i];
            	return;
          	}
        }
    }
}