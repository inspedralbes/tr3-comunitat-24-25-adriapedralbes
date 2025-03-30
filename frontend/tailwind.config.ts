import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				'color-1': 'hsl(var(--color-1))',
				'color-2': 'hsl(var(--color-2))',
				'color-3': 'hsl(var(--color-3))',
				'color-4': 'hsl(var(--color-4))',
				'color-5': 'hsl(var(--color-5))'
			},
			animation: {
				'border-glow': 'border-glow 2s ease-in-out infinite',
				'border-gradient': 'border-gradient 2s ease-in-out infinite',
				'gradient-x': 'gradient-x 3s ease infinite',
				'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
				'fade-in': 'fadeIn 0.5s ease-out forwards',
				'fade-out': 'fadeOut 0.5s ease-out forwards',
				shine: 'shine 6s linear infinite',
				marquee: 'marquee var(--duration) infinite linear',
				'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
				'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
				'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
				rainbow: 'rainbow var(--speed, 2s) infinite linear',
				'slide-up': 'slideUp 0.7s ease-out forwards',
				'slide-down': 'slideDown 0.7s ease-out forwards',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 3',
				'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) 3',
				'bounce-once': 'bounce 1s ease-in-out 1',
				'wiggle': 'wiggle 1s ease-in-out 2',
				'float-up-fade': 'floatUpFade 1.5s ease-out forwards',
                'number-change': 'numberChange 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'highlight-fade': 'highlightFade 2s ease forwards',
                'move-up': 'moveUp 1.5s ease-in-out forwards',
                'move-down': 'moveDown 1.5s ease-in-out forwards',
			},
			keyframes: {
				'border-glow': {
					'0%, 100%': {
						'box-shadow': '0 0 0 rgba(139, 92, 246, 0)'
					},
					'50%': {
						'box-shadow': '0 0 20px rgba(139, 92, 246, 0.3)'
					}
				},
				'border-gradient': {
					'0%, 100%': {
						opacity: '0'
					},
					'50%': {
						opacity: '1'
					}
				},
				'gradient-x': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				},
				fadeInUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				shine: {
					'0%': {
						backgroundPosition: '0 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				marquee: {
					from: {
						transform: 'translateX(0)'
					},
					to: {
						transform: 'translateX(calc(-100% - var(--gap)))'
					}
				},
				'marquee-vertical': {
					from: {
						transform: 'translateY(0)'
					},
					to: {
						transform: 'translateY(calc(-100% - var(--gap)))'
					}
				},
				'shimmer-slide': {
					to: {
						transform: 'translate(calc(100cqw - 100%), 0)'
					}
				},
				'spin-around': {
					'0%': {
						transform: 'translateZ(0) rotate(0)'
					},
					'15%, 35%': {
						transform: 'translateZ(0) rotate(90deg)'
					},
					'65%, 85%': {
						transform: 'translateZ(0) rotate(270deg)'
					},
					'100%': {
						transform: 'translateZ(0) rotate(360deg)'
					}
				},
				rainbow: {
					'0%': {
						'background-position': '0%'
					},
					'100%': {
						'background-position': '200%'
					}
				},
				slideUp: {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)',
						backgroundColor: 'rgba(34, 197, 94, 0.05)'
					},
					'15%': {
						backgroundColor: 'rgba(34, 197, 94, 0.15)',
						transform: 'translateY(-3px) scale(1.02)'
					},
					'70%': {
						backgroundColor: 'rgba(34, 197, 94, 0.1)',
						transform: 'translateY(-5px) scale(1.01)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)',
						backgroundColor: 'rgba(34, 197, 94, 0.03)'
					}
				},
				slideDown: {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)',
						backgroundColor: 'rgba(239, 68, 68, 0.05)'
					},
					'15%': {
						backgroundColor: 'rgba(239, 68, 68, 0.15)',
						transform: 'translateY(3px) scale(1.02)'
					},
					'70%': {
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						transform: 'translateY(5px) scale(1.01)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)',
						backgroundColor: 'rgba(239, 68, 68, 0.03)'
					}
				},
				wiggle: {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' },
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				ping: {
					'75%, 100%': {
						transform: 'scale(1.1)',
						opacity: '0'
					}
				},
				floatUpFade: {
					'0%': {
						opacity: '0',
						transform: 'translateY(5px) scale(1)'
					},
					'20%': {
						opacity: '1',
						transform: 'translateY(0) scale(1.2)'
					},
					'80%': {
						opacity: '1',
						transform: 'translateY(-10px) scale(1)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-15px) scale(0.9)'
					}
				},
				numberChange: {
					'0%': {
						transform: 'scale(1)',
						boxShadow: '0 0 0 rgba(255, 255, 255, 0)'
					},
					'30%': {
						transform: 'scale(1.2)',
						boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)'
					},
					'60%': {
						transform: 'scale(1.1)',
						boxShadow: '0 0 12px rgba(255, 255, 255, 0.3)'
					},
					'100%': {
						transform: 'scale(1)',
						boxShadow: '0 0 0 rgba(255, 255, 255, 0)'
					}
				},
				highlightFade: {
					'0%': {
						backgroundColor: 'rgba(59, 130, 246, 0.3)'
					},
					'100%': {
						backgroundColor: 'rgba(59, 130, 246, 0)'
					}
				},
                moveUp: {
                    '0%': {
                        transform: 'translateY(0)',
                        zIndex: '10'
                    },
                    '20%': {
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                        zIndex: '10'
                    },
                    '60%': {
                        transform: 'translateY(-30px) scale(1.02)',
                        boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)',
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                        zIndex: '10'
                    },
                    '100%': {
                        transform: 'translateY(-100%)',
                        opacity: '0.5',
                        zIndex: '10'
                    }
                },
                moveDown: {
                    '0%': {
                        transform: 'translateY(0)',
                        zIndex: '0'
                    },
                    '20%': {
                        transform: 'translateY(3px) scale(1.02)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                        zIndex: '0'
                    },
                    '60%': {
                        transform: 'translateY(30px) scale(1.02)',
                        boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        zIndex: '0'
                    },
                    '100%': {
                        transform: 'translateY(100%)',
                        opacity: '0.5',
                        zIndex: '0'
                    }
                },
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;