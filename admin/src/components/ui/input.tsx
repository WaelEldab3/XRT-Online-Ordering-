import TooltipLabel from '@/components/ui/tooltip-label';
import cn from 'classnames';
import React, { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  label?: string;
  toolTipText?: string;
  note?: string;
  name: string;
  error?: string;
  type?: string;
  shadow?: boolean;
  variant?: 'normal' | 'solid' | 'outline';
  dimension?: 'small' | 'medium' | 'big';
  showLabel?: boolean;
  required?: boolean;
}

const classes = {
  root: 'px-4 h-12 flex items-center w-full rounded appearance-none transition-all duration-200 ease-in-out text-heading text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-0',
  normal:
    'bg-gray-50 border border-gray-300 focus:shadow-sm focus:bg-white focus:border-accent',
  solid:
    'bg-gray-50 border border-gray-200 focus:bg-white focus:border-accent',
  outline: 'border border-gray-300 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20',
  shadow: 'focus:shadow-md',
};
const sizeClasses = {
  small: 'text-sm h-10',
  medium: 'h-12',
  big: 'h-14',
};
const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      label,
      note,
      name,
      error,
      children,
      variant = 'normal',
      dimension = 'medium',
      shadow = false,
      type = 'text',
      inputClassName,
      disabled,
      showLabel = true,
      required,
      toolTipText,
      labelClassName,
      ...rest
    },
    ref,
  ) => {
    const rootClassName = cn(
      classes.root,
      {
        [classes.normal]: variant === 'normal',
        [classes.solid]: variant === 'solid',
        [classes.outline]: variant === 'outline',
      },
      {
        [classes.shadow]: shadow,
      },
      sizeClasses[dimension],
      inputClassName,
    );
    let numberDisable = type === 'number' && disabled ? 'number-disable' : '';
    return (
      <div className={twMerge(className)}>
        {showLabel || label ? (
          <TooltipLabel
            htmlFor={name}
            toolTipText={toolTipText}
            label={label}
            required={required}
            className={labelClassName}
          />
        ) : (
          ''
        )}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          className={twMerge(
            cn(
              disabled
                ? `cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500 ${numberDisable} select-none`
                : '',
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : '',
              rootClassName,
            ),
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...rest}
        />
        {note && <p className="mt-2 text-xs text-gray-600">{note}</p>}
        {error && (
          <p id={`${name}-error`} className="mt-2 text-xs text-red-600 text-start" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
