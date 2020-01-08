import React, { FC } from 'react';
import { DatePicker, DatePickerProps, TimePicker, TimePickerProps } from '@material-ui/pickers';
import { FormikValues } from 'formik';
import { IFieldProps } from '../index';
import { get } from 'lodash';


export const MUIDatePicker: FC<IFieldProps & { fieldProps?: DatePickerProps }> = (props) => {
    const { fieldProps = {} as DatePickerProps, formikProps = {} as FormikValues } = props;
    const fieldError = get(formikProps, `errors.${fieldProps.name}`);
    const updatedProps = {
        ...fieldProps,
        error: !!fieldError,
        helperText: (fieldError || ''),
        onChange: formikProps.handleChange,
        value: get(formikProps, `values.${fieldProps.name}`) || '',
        onError: (error: string) => {
            // handle as a side effect
            if (error !== fieldError) {
                formikProps.setFieldError(fieldProps.name, error);
            }
        }
    };

    console.log('Field updated props', updatedProps);
    return (
        <DatePicker
            {...updatedProps}
        />
    )
}

export const MUITimePicker: FC<IFieldProps & { fieldProps?: TimePickerProps }> = props => {
    const { fieldProps = {} as TimePickerProps, formikProps = {} as FormikValues } = props;
    const fieldError = get(formikProps, `errors.${fieldProps.name}`);
    const updatedProps = {
        ...fieldProps,
        error: !!fieldError,
        helperText: (fieldError || ''),
        onChange: formikProps.handleChange,
        value: get(formikProps, `values.${fieldProps.name}`) || '',
        onError: (error: string) => {
            // handle as a side effect
            if (error !== fieldError) {
                formikProps.setFieldError(fieldProps.name, error);
            }
        }
    };
    return (
        <TimePicker {...updatedProps} />
    )
}

