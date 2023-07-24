import { h, JSX } from "preact"

function Dropdown(props: {
    value: string | number
    onChange: any
    hide?: boolean
    options: Array<{ value: string | number; label: string }>
    onClick?: () => void
}): JSX.Element {

    return (
        <select className={`wcg-block wcg-max-w-[9.5rem] wcg-border-0 wcg-p-2.5 wcg-pr-2 wcg-text-sm focus:wcg-ring-0 dark:wcg-bg-neutral${!props.hide ? '' : ' wcg-hidden'}`}
            value={props.value}
            onChange={props.onChange}
            onClick={props.onClick}
        >
            {props.options.map(({ value, label }) => (
                <option className="wcg-bg-[#343541] wcg-text-white"
                 key={value} value={value}>{label}</option>
            ))}
        </select>
    )
}

export default Dropdown
