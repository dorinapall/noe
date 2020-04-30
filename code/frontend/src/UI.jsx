import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

export function View({ children }) {
  return (
    <div className="ViewContainer">
      <div className="View">{children}</div>
    </div>
  );
}

export function Caption({ children, ...props }) {
  const classes = classNames("Caption", "Text", { CenterText: props.center });
  return (
    <h2 onDoubleClick={props.onDoubleClick} className={classes}>
      {children}
    </h2>
  );
}

export function Form({ children, onSubmit }) {
  return (
    <form className="Form" onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function Field({
  value,
  name,
  label,
  type,
  register,
  errors: allErrors,
  options,
  hidden,
  helpText,
  required,
  onChange,
  placeholder,
  defaultValue,
  selectOptionText,
  min,
  pattern,
  disabled,
}) {
  let errorMessage = null;
  if (!!allErrors) {
    const errors = allErrors[name];
    if (errors) {
      if (errors.type === "required") {
        errorMessage = "Ez a mező kötelező.";
      } else if (errors.type === "pattern") {
        errorMessage = errors.message || "Érvénytelen formátum";
      } else {
        errorMessage = errors.message;
      }
    }
  }

  return (
    <InputGroup hidden={hidden} hasError={errorMessage !== null}>
      {type === "checkbox" ? (
        <Label htmlFor={name} noMargin>
          <Input
            value={value}
            name={name}
            label={label}
            type={type}
            register={register}
            options={options}
            id={name}
            required={required}
            defaultValue={defaultValue}
          />
          {label}
        </Label>
      ) : (
        <>
          {label && <Label htmlFor={name}>{label}</Label>}
          <Input
            value={value}
            name={name}
            label={label}
            type={type}
            register={register}
            options={options}
            id={name}
            required={required}
            onChange={onChange}
            placeholder={placeholder}
            defaultValue={defaultValue}
            selectOptionText={selectOptionText}
            min={min}
            pattern={pattern}
            disabled={disabled}
          />
        </>
      )}
      {(errorMessage || helpText) && (
        <HelpBlock error>{errorMessage || helpText}</HelpBlock>
      )}
    </InputGroup>
  );
}

export function Input({
  value,
  name,
  type,
  register,
  options,
  required,
  onChange,
  style,
  placeholder,
  defaultValue,
  selectOptionText,
  min,
  pattern,
  disabled,
}) {
  if (type === "checkbox") {
    return (
      <input
        id={name}
        className="Input Inline"
        name={name}
        ref={register({ required })}
        type={type}
        value={value} // Value instead of true
        defaultValue={defaultValue}
      />
    );
  } else if (type === "select") {
    return (
      <select
        className="Input"
        name={name}
        ref={register({ required })}
        type={type}
        defaultValue={defaultValue || ""}
        onChange={onChange && ((event) => onChange(event.target.value))}
        disabled={disabled}
      >
        {!!selectOptionText && (
          <option disabled value="" hidden>
            {selectOptionText}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      style={style}
      className="Input"
      name={name}
      ref={register({ required, pattern })}
      type={type || "text"}
      onChange={onChange}
      placeholder={placeholder}
      defaultValue={defaultValue}
      min={min || null}
    />
  );
}

export function InputGroup({ children, hidden, hasError }) {
  const classes = classNames("InputGroup", {
    Hidden: hidden,
    HasError: hasError,
  });
  return <div className={classes}>{children}</div>;
}

export function Label({ children, className, htmlFor, noMargin }) {
  const classes = classNames("Label", { NoMargin: noMargin });
  return (
    <label className={`${classes} ${className || ""}`} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function Button({
  children,
  type,
  onClick,
  toCenter,
  inverse,
  disabled,
  iconOnly,
  noBorder,
  inline,
  nextButton,
  paymentOption,
}) {
  const classes = classNames("Button", {
    ToCenter: toCenter,
    Inverse: inverse,
    Disabled: disabled,
    IconOnly: iconOnly,
    NoBorder: noBorder,
    Inline: inline,
    NextButton: nextButton,
    PaymentOption: paymentOption,
  });
  return (
    <button
      className={classes}
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function NextButton({ children, ...props }) {
  return (
    <Button {...props} nextButton>
      {children || "Tovább"}
    </Button>
  );
}

export function HelpBlock({ children, error }) {
  return <p className="HelpBlock">{children}</p>;
}

export function Text({
  children,
  center,
  highlight,
  toCenter,
  light,
  strong,
  right,
  onClick,
  style,
  semiLight,
  dark,
}) {
  const classes = classNames("Text", {
    CenterText: center,
    HighlightText: highlight,
    ToCenter: toCenter,
    Light: light,
    Strong: strong,
    RightText: right,
    SemiLight: semiLight,
    Dark: dark,
  });
  return (
    <p style={style} onClick={onClick} className={classes}>
      {children}
    </p>
  );
}

export function HighlightText({ children, center, ...props }) {
  return (
    <Text highlight {...props}>
      {children}
    </Text>
  );
}

export function Image({ src }) {
  return (
    <div className="ImageContainer">
      <img src={src} alt="alt" />
    </div>
  );
}

export function LinkButton({ to, toCenter, inverse, nextButton, children }) {
  const classes = classNames("Button", {
    ToCenter: toCenter,
    Inverse: inverse,
    NextButton: nextButton,
  });
  return (
    <Link className={classes} to={to}>
      {children}
    </Link>
  );
}

export function NextLinkButton(props) {
  return (
    <LinkButton {...props} nextButton>
      Tovább
    </LinkButton>
  );
}

export function DataRow({ children }) {
  return <div className="DataRow">{children}</div>;
}

export function IconButton({ icon, onClick }) {
  return (
    <Button iconOnly inverse noBorder inline onClick={onClick}>
      <Icon icon={icon} />
    </Button>
  );
}

export function Icon({ icon }) {
  return <i className={`fa fa-${icon}`} />;
}

export function Flex({ children }) {
  return <div className="Flex">{children}</div>;
}

export function Toggle({ options, value, register, name, defaultValue }) {
  const [state, setState] = React.useState(defaultValue);
  return (
    <div className="Toggle">
      {options.map((option) => {
        let classes = classNames("Option", { Active: option.value === state });
        return (
          <Label className={classes} key={`${name}-${option.value}`}>
            <input
              type="radio"
              name={name}
              value={option.value}
              ref={register()}
              onChange={(e) => setState(option.value)}
              defaultChecked={option.value === defaultValue}
            />
            {option.text}
          </Label>
        );
      })}
    </div>
  );
}

export function TopStripe({ children }) {
  return <div className="TopStripe">{children}</div>;
}

export function Pill({ text, icon, info, success, error, to }) {
  const classes = classNames("Pill", {
    Info: info,
    Success: success,
    Error: error,
  });

  let iconClass = icon;
  if (!icon) {
    if (info) {
      iconClass = "info";
    } else if (success) {
      iconClass = "check";
    } else if (error) {
      iconClass = "close";
    }
  }

  if (to) {
    if (to.startsWith("http")) {
      // external link
      return (
        <div className="PillContainer">
          <a
            className={classes}
            href={to}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="Text">{text}</div>
            <div className="Circle">
              <Icon icon={iconClass} />
            </div>
          </a>
        </div>
      );
    }
    return (
      <div className="PillContainer">
        <Link className={classes} to={to}>
          <div className="Text">{text}</div>
          <div className="Circle">
            <Icon icon={iconClass} />
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="PillContainer">
      <div className={classes}>
        <div className="Text">{text}</div>
        <div className="Circle">
          <Icon icon={iconClass} />
        </div>
      </div>
    </div>
  );
}
