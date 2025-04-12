import React from 'react'
import { motion } from 'motion/react'

export function TextInput({
    label,
    desc,
    value,
    onChange,
    onBlur,
    placeholder,
    autoComplete,
    isPassword,
    width,
    errorMessage: error,
    disabled
}: {
    label?: string
    desc?: string
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    placeholder?: string
    autoComplete?: 'email' | 'current-password' | 'new-password' | 'off'
    isPassword?: boolean
    width?: React.CSSProperties['width']
    errorMessage?: string
    disabled?: boolean
}) {
    const id = React.useId()
    const [isFocused, setIsFocused] = React.useState(false)

    return (
        <div className='flex flex-col justify-center gap-0' style={{ width }}>
            {label !== undefined && (
                <label htmlFor={id} className='font-nunitoSans text-black text-sm font-medium'>
                    {label}
                </label>
            )}
            {desc !== undefined && (
                <label htmlFor={id} className='font-nunitoSans text-gray-120 text-xs font-normal'>
                    {desc}
                </label>
            )}
            <motion.input
                type={isPassword ? 'password' : 'text'}
                id={id}
                autoComplete={autoComplete ?? 'off'}
                animate={
                    error === undefined
                        ? {
                              borderColor: 'var(--color-gray-240)',
                              boxShadow: '0px 0px 0px 0px var(--color-primary-100)'
                          }
                        : {
                              borderColor: 'var(--color-error)',
                              boxShadow: '0px 0px 0px 0px var(--color-primary-100)'
                          }
                }
                whileFocus={
                    error === undefined
                        ? {
                              borderColor: 'var(--color-primary-100)',
                              boxShadow: '0px 0px 0px 1px var(--color-primary-100)'
                          }
                        : {}
                }
                whileHover={error === undefined && !isFocused ? { borderColor: 'var(--color-gray-120)' } : {}}
                transition={{ duration: 0.1 }}
                className={`font-nunitoSans mt-1 rounded-md border px-3 py-2 text-sm font-normal focus-visible:outline-none ${
                    error === undefined ? 'text-black placeholder-gray-120' : 'text-error placeholder-error-light'
                }`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => {
                    setIsFocused(true)
                }}
                onBlur={(e) => {
                    setIsFocused(false)
                    onBlur?.(e)
                }}
                disabled={disabled}
            />
            {error !== undefined && error !== '' && <p className='font-nunitoSans text-error mt-1 text-xs font-normal'>{error}</p>}
        </div>
    )
}
