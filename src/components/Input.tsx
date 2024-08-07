import React, { FC, ChangeEvent, Ref, forwardRef, useState } from 'react';
import {
    VisibilityOff as VisibilityOffIcon,
    Visibility as VisibilityIcon,
    Info as InfoIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import StylesVariables from '@/styles/utils/variables.module.scss';

interface IProps {
    id: string;
    name: string;
    type: 'text' | 'password' | 'number' | 'search' | 'multiline';
    label: string;
    tooltip?: string;
    value?: string;
    error?: string;
    clear?: () => void;
    onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Input: FC<IProps> = forwardRef<HTMLInputElement | HTMLTextAreaElement, IProps>(({
                                                                                          id,
                                                                                          name,
                                                                                          type,
                                                                                          label,
                                                                                          tooltip,
                                                                                          value,
                                                                                          error,
                                                                                          clear,
                                                                                          onChange,
                                                                                          ...props
                                                                                      }, ref) => {
    const [ showPassword, setShowPassword ] = useState<boolean>(false);

    const getTypes = (type: string) => {
        switch (type) {
            case 'password':
                return showPassword ? 'text' : 'password';
            case 'number':
                return 'text';
            default:
                return type;
        }
    };

    return (
        <div className="input">
            <div className={ "wrap" + (type === 'multiline' ? " with-bg" : "") }>
                {
                    type === 'multiline'
                        ? <textarea
                            ref={ ref as Ref<HTMLTextAreaElement> }
                            id={ id }
                            name={ name }
                            placeholder="hidden"
                            value={ value }
                            onChange={ onChange }
                            { ...props }
                        />
                        : <input
                            className={ type === 'password' ? 'with-icon' : '' }
                            ref={ ref as Ref<HTMLInputElement> }
                            id={ id }
                            name={ name }
                            type={ getTypes(type) }
                            inputMode={ type === 'number' ? 'numeric' : 'text' }
                            autoComplete={ type }
                            placeholder="hidden"
                            value={ value }
                            onChange={ onChange }
                            { ...props }
                        />
                }

                { type === 'password' && (
                    <button type="button" onClick={ () => setShowPassword(prevState => !prevState) }>
                        { showPassword ?
                            <VisibilityOffIcon className="input-icon" /> :
                            <VisibilityIcon className="input-icon" /> }
                    </button>
                ) }

                { type === 'search' && (
                    <>
                        { value && value.length > 0 ? (
                            <button className="clear" type="button" onClick={ clear }>
                                +
                            </button>
                        ) : (
                            <>
                                <div className="search-icon default">
                                    <SearchIcon sx={ { color: StylesVariables.primaryColor } } />
                                </div>

                                <div className="search-icon hovered">
                                    <SearchIcon sx={ { color: StylesVariables.accentColor } } />
                                </div>
                            </>
                        ) }
                    </>
                ) }

                <label htmlFor={ id }>
                    { label }
                    { tooltip && tooltip.length > 0 && (
                        <span
                            className="tooltip"
                            data-tooltip-id={ id }
                            data-tooltip-content={ tooltip }
                        >
                            <InfoIcon sx={ { color: StylesVariables.specialColor } } />
                        </span>
                    ) }
                </label>

                <div className="background"></div>
            </div>

            { error && <p className="error">{ error }</p> }
        </div>
    );
});

export default Input;
