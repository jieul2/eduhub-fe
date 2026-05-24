import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { buttonRadius, buttonSizes, buttonVariants } from './Button.tokens';
import type { ButtonProps } from './Button.types';
import { Spinner } from '../Spinner/Spinner';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			size = 'default',
			variant = 'primary',
			radius = 'md',
			isFullWidth,
			className,
			children,
			disabled,
			isLoading,
			...props
		},
		ref,
	) => {
		// disabled 상태일 때 자동으로 disable 변형 적용
		const currentVariant = disabled ? 'disable' : variant;

		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				className={cn(
					'inline-flex items-center justify-center gap-2 transition-colors duration-200 font-medium',
					buttonSizes[size],
					buttonVariants[currentVariant],
					buttonRadius[radius],
					isFullWidth && 'w-full',
					className,
				)}
				{...props}
			>
				{isLoading ? (
					<>
						<Spinner size="sm" className="text-current" />
						<span>처리중...</span>
					</>
				) : (
					children
				)}
			</button>
		);
	},
);

Button.displayName = 'Button';

export default Button;
