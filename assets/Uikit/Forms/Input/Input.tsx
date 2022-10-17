import { forwardRef } from 'react'

import MuiInput from '@mui/material/Input'
import { InputBaseComponentProps } from '@mui/material/InputBase'
import { Controller, ControllerRenderProps, FieldValues, Path, RegisterOptions, UseFormReturn } from 'react-hook-form'

import { TColors } from '@Uikit/Colors/TColors'
import { PdvIcons } from '@Uikit/Icons/PdvIcons'
import { TIconNames } from '@Uikit/Icons/TIconNames'

export type TVariant = 'default' | 'outlined' | 'transparent'
export type TBaseInput = {
  id?: string
  variant?: TVariant
  theme?: TColors
  icon?: TIconNames
  iconColor?: TColors
  iconPosition?: 'left' | 'right'
  inputProps?: InputBaseComponentProps
  controlFields?: ControllerRenderProps<Record<string, string>, string>
  value?: string
}
export const disabledStyles = 'bg-transparent text-gray-200 cursor-not-allowed'
export const inputVariants: Record<TVariant, string> = {
  outlined: 'rounded-md border border-gray-300 hover:border-primary-color focus-within:border-primary-color px-2 bg-white',
  default: 'border-b-2 border-gray-300 hover:border-primary-color focus:border-primary-color pl-0 pr-2',
  transparent: 'border-0 pl-0 pr-2'
}

const BaseInput = forwardRef<HTMLInputElement, TBaseInput>((props, ref) => {
  const { iconColor = 'primary-color' } = props
  const inputProps = props?.inputProps ? { ...props.inputProps } : {}
  const selectedVariant = props.variant ? inputVariants[props.variant] : inputVariants.outlined

  if (props?.icon) {
    const icon = <PdvIcons name={props.icon} color={props.inputProps?.disabled ? 'gray-200' : iconColor} />

    return (
      <div
        className={`flex w-full items-center overflow-hidden text-gray-500 transition ease-in-out ${
          props?.inputProps?.disabled ? disabledStyles : selectedVariant
        }`}
      >
        {props?.iconPosition !== 'right' && <span className="mx-1">{icon}</span>}
        <MuiInput
          disableUnderline
          {...props?.controlFields}
          ref={ref}
          inputProps={inputProps}
          id={props?.id}
          className={`subtitle2 w-full ${props.inputProps?.disabled ? disabledStyles : 'text-gray-500'}  focus:outline-none ${
            props.iconPosition === 'right' ? 'px-4' : 'pr-4'
          } ${props.inputProps?.className ?? ''}`}
          sx={{ height: 44 }}
        />
        {props?.iconPosition === 'right' && <span className="mr-1">{icon}</span>}
      </div>
    )
  }

  return (
    <>
      <MuiInput
        disableUnderline
        {...props?.controlFields}
        ref={ref}
        inputProps={inputProps}
        id={props?.id}
        className={`subtitle2 focus:outline-none ${props.inputProps?.disabled ? disabledStyles : 'text-gray-500'} ${
          props?.inputProps?.disabled ? disabledStyles : selectedVariant
        } ${props.inputProps?.className ?? ''}`}
        sx={{ height: 44 }}
      />
    </>
  )
})
BaseInput.displayName = 'BaseInput'

export type TInput<TFormValues extends FieldValues> = {
  name: Path<TFormValues>
  form: UseFormReturn<TFormValues>
  options?: RegisterOptions
} & TBaseInput

export const Input = <TFormValues extends FieldValues>(props: TInput<TFormValues>) => {
  const { form, options, ...restProps } = props

  return (
    <Controller
      name={props.name}
      control={form.control}
      rules={options}
      render={({ field: { value, ...restField } }) => {
        const inputValue = value
        const controlFields = { value: inputValue, ...restField }

        return <BaseInput {...restProps} controlFields={controlFields} />
      }}
    />
  )
}

export const ForwardedInput = forwardRef<HTMLInputElement, TBaseInput>((props, ref) => <BaseInput ref={ref} {...props} />)
ForwardedInput.displayName = 'ForwardedInput'

export default Input