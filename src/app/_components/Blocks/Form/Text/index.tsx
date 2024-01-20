import React from 'react'
import { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { TextField } from '@payloadcms/plugin-form-builder/dist/types'

import { Error } from '../Error'
import { Width } from '../Width'

import classes from './index.module.scss'

export const Text: React.FC<
  TextField & {
    register: UseFormRegister<FieldValues & any>
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    width?: string
  }
> = ({ name, label, width, register, required: requiredFromProps, errors }) => {
  return (
    <Width width={width}>
      <div className={classes.wrap}>
        <label htmlFor={name} className={classes.label}>
          {label}
        </label>
        <input
          type="text"
          className={classes.input}
          id={name}
          {...register(name, { required: requiredFromProps })}
        />
        {requiredFromProps && errors[name] && <Error />}
      </div>
    </Width>
  )
}
