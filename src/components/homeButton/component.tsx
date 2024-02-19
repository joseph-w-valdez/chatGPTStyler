import React from "react";
import css from "./styles.module.css";

interface HomeButtonProps {
    dataTestid: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    btnLabel: string;
}

export function HomeButton({
    dataTestid,
    onClick,
    btnLabel,
}: HomeButtonProps): JSX.Element {
    return (
        <button className={css.btn} data-testid={dataTestid} onClick={onClick}>
            {btnLabel}
        </button>
    );
}
