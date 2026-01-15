import TooltipLabel from '@/components/ui/tooltip-label';
import { default as classNames, default as cn } from 'classnames';
import React, { TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  inputClassName?: string;
  toolTipText?: string;
  label?: string;
  name: string;
  error?: string;
  shadow?: boolean;
  variant?: 'normal' | 'solid' | 'outline';
  disabled?: boolean;
}

const classes = {
  root: 'align-middle py-3 px-4 w-full rounded-lg appearance-none transition-all duration-200 ease-in-out text-heading text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-0',
  normal:
    'bg-gray-50 border border-gray-300 focus:shadow-sm focus:bg-white focus:border-accent',
  solid:
    'bg-gray-50 border border-gray-200 focus:bg-white focus:border-accent',
  outline: 'border border-gray-300 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20',
  shadow: 'focus:shadow-md',
};

const TextArea = React.forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const {
    className,
    label,
    toolTipText,
    name,
    error,
    variant = 'normal',
    shadow = false,
    inputClassName,
    disabled,
    required,
    ...rest
  } = props;

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
    inputClassName,
  );

  return (
    <div className={twMerge(classNames(className))}>
      {label && (
        <TooltipLabel
          htmlFor={name}
          toolTipText={toolTipText}
          label={label}
          required={required}
        />
      )}
      <textarea
        id={name}
        name={name}
        className={twMerge(
          classNames(
            rootClassName,
            disabled ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500' : '',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : '',
          ),
        )}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        rows={4}
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="mt-2 text-xs text-red-600 ltr:text-left rtl:text-right" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
