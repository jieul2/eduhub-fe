import type { ComponentProps } from 'react';
import type { ButtonRadius, ButtonSize, ButtonVariant } from './Button.tokens';

export type ButtonProps = {
	size?: ButtonSize;
	variant?: ButtonVariant;
	radius?: ButtonRadius;
	isFullWidth?: boolean;
} & ComponentProps<'button'>;
