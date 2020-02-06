import React, { FC, useEffect, useState } from 'react';
import { map, isArray, uniqueId, get } from 'lodash';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { FormikValues } from 'formik';
import { MUITextField, MUISelectField, MUICheckBox, MUISwitch, MUIRadio, MUIPlaceSuggest } from './lib';

export interface FormConfig {
    type: string
    name?: string
    id?: string,
    valueKey: string
    flex?: number | string
    fieldProps?: object
    styles?: object
    classNames?: Array<string>
}

interface RowSettingsProps {
    horiontalSpacing?: number
    verticalSpacing?: number
    columnHorizontalPadding?: number
}
export interface BuilderSettingsProps extends RowSettingsProps {

}

export type RowSchema = Array<FormConfig> | FormConfig | { columns: Array<FormConfig>, settings?: RowSettingsProps };
export interface FormRowProps {
    schema: RowSchema
    rowId: string
    formikProps?: FormikValues,
    settings?: BuilderSettingsProps
}



type submitButtonLayout = "right" | "center" | "fullwidth";
export interface IFormActionProps {
    submitButtonText?: string,
    submitButtonProps?: ButtonProps
    submitButtonLayout?: submitButtonLayout,
    actionContent?: JSX.Element,
    containerClassNames?: string | string[],
    displayActions?: boolean
}
export interface BuilderProps {
    schema: Array<RowSchema>
    formId: string
    formikProps?: FormikValues,
    actionConfig?: IFormActionProps
    settings?: BuilderSettingsProps
}

export interface IFieldProps {
    formikProps?: FormikValues,
    fieldConfig?: FormConfig
}

let ComponentMapConfig: { [key: string]: { component: JSX.Element, props?: object } } = {};

export const attachField = (type: Array<string> | string, component: JSX.Element, props?: object) => {
    if (isArray(type)) {
        map(type, item => ComponentMapConfig[item] = { component, props })
    } else
        ComponentMapConfig[type] = { component, props };

}


attachField('text', <MUITextField />, { type: 'text' });
attachField('password', <MUITextField />, { type: 'password' });
attachField('select', <MUISelectField />);
attachField('checkbox', <MUICheckBox />);
// attachField('date-picker', <MUIDatePicker />, { variant: 'inline', label: 'Select Date' });
// attachField('time-picker', <MUITimePicker />, { variant: 'inline', label: 'Select Time' });
attachField('location-suggest', <MUIPlaceSuggest />);
attachField('switch', <MUISwitch />);
attachField('radio', <MUIRadio />);



export const BuildFormRow: FC<FormRowProps> = props => {
    const { schema, rowId, formikProps, settings = { horiontalSpacing: 10, verticalSpacing: 10, columnHorizontalPadding: 0 } } = props;
    let columnItems = get(schema, 'columns') as Array<FormConfig>;
    let rowSettings = { ...settings, ...get(schema, 'settings') } as RowSettingsProps;
    const colItems = (isArray(schema) ? schema : ((isArray(columnItems) ? columnItems : [schema])));
    const classes = useFormStyles();
    const rowStyle = { marginBottom: (rowSettings.verticalSpacing || 10) };
    return (
        <div className={classes.row} style={rowStyle}>
            {
                map(colItems, (item: FormConfig, index) => {
                    const componentConfig = ComponentMapConfig[item.type];
                    const horizontalSpacing = (index === (colItems.length - 1)) ? 0 : (rowSettings.horiontalSpacing || 10);
                    if (!componentConfig)
                        return <div key={`${rowId}_field_${index}`} />;


                    const fieldProps = { id: item.id, name: (item.name || item.valueKey), ...componentConfig.props, ...item.fieldProps };
                    const Component = componentConfig.component;
                    return (
                        <div key={`${rowId}_field_${index}`} className={clsx(item.classNames, classes.column)} style={
                            {
                                flex: (item.flex || 1),
                                marginRight: horizontalSpacing,
                                paddingLeft: rowSettings.columnHorizontalPadding,
                                paddingRight: rowSettings.columnHorizontalPadding,
                                ...item.styles
                            }
                        }>
                            {

                                React.cloneElement(Component, { fieldProps, formikProps, fieldConfig: item })
                            }
                        </div>
                    )

                })
            }
        </div>
    )
}

const getUpdateSchema = (schema: Array<RowSchema>, formId: string) => {
    return map(schema, schemaItem => {
        if (isArray(schemaItem)) {
            return map(schemaItem, item => ({ ...item, id: `${formId}_${uniqueId()}` }));
        }
        return { ...schemaItem, id: `${formId}_${uniqueId()}` };
    });
}

export const MLFormContent: FC<BuilderProps> = props => {
    const { schema, formId, formikProps, settings } = props;
    const [formSchema, setFormSchema] = useState<Array<RowSchema>>(schema);
    useEffect(() => {
        setFormSchema(getUpdateSchema(schema, formId));
    }, [schema])
    return (
        <>
            {
                map(formSchema, (configRow, index) => {
                    const rowId = `${formId}_row_${index}`;
                    return (<BuildFormRow key={rowId} rowId={rowId} schema={configRow} formikProps={formikProps} settings={settings} />);
                })
            }
        </>
    )
}

export const MLFormAction: FC<IFormActionProps & Pick<BuilderProps, 'formId' | 'formikProps'>> = (props) => {
    const { formId, formikProps = {} as FormikValues, containerClassNames, submitButtonLayout = 'center', submitButtonText = "Submit", submitButtonProps } = props;
    const classes = useFormStyles();
    if (props.actionContent)
        return (React.cloneElement(props.actionContent || <div />, { formikProps }));
    const layoutClassName = `action-${submitButtonLayout}`
    return (
        <div className={clsx(classes.actionContainer, layoutClassName, containerClassNames)}>
            {
                (props.actionContent) ?
                    (React.cloneElement(props.actionContent || <div />, { formikProps, formId }))
                    : (
                        <>
                            <Button type="submit" variant="contained" color="primary" {...submitButtonProps}>{submitButtonText}</Button>
                        </>
                    )
            }
        </div>
    )
}

export const MLFormBuilder: FC<BuilderProps> = props => {
    const { formikProps = {} as FormikValues, actionConfig = {} as IFormActionProps } = props;
    return (
        <form onSubmit={formikProps.handleSubmit}>
            <MLFormContent {...props} />
            {
                (actionConfig.displayActions !== false) &&
                (<MLFormAction formId={props.formId} formikProps={formikProps} {...actionConfig} />)
            }

        </form>
    )
}


const useFormStyles = makeStyles<Theme>(() => {
    return (createStyles({
        row: {
            display: 'flex'
        },
        column: {},
        actionContainer: {
            display: 'flex',
            justifyContent: 'center',
            '&.action-center': {
                justifyContent: 'center'
            },
            '&.action-right': {
                justifyContent: 'flex-end'
            },
            '&.action-fullwidth > button': {
                flex: 1
            }
        }
    }))
})

export default MLFormBuilder;