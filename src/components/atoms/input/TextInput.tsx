import { useField } from 'formik';
import React, { InputHTMLAttributes, useRef } from 'react';
import { cn } from '../../../utils';

type ITextInputSize = 'small' | 'medium' | 'large';

type IProps = InputHTMLAttributes<HTMLInputElement> & {
  inputsize?: ITextInputSize;
};

const TextInput: React.FC<IProps> = (props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const { inputsize, className, name, ...rest } = props;
  const [field, { error, touched }] = useField(name!);

  return (
    <div className="my-3">
      <input
        ref={inputRef}
        {...field}
        {...rest}
        className={cn(
          'w-full rounded-md border border-gray-300 px-2 outline-none focus:border-primary',
          inputsize === 'small'
            ? 'h-7'
            : inputsize === 'large'
              ? 'h-12'
              : 'h-8',
          className,
        )}
      />
      {touched && error && (
        <div className="w-full text-sm text-red-500">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export { TextInput };

