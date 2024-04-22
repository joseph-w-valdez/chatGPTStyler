export const arrowUpAutoFill = () => {
    window.onload = () => {
        const $inputBox = document.getElementById("prompt-textarea");
        let $lastMessage: string | null = "";

        const updateDivs = () => {
            const $divs = document.querySelectorAll(
                'div[data-message-author-role="user"]',
            );
            $lastMessage = $divs[$divs.length - 1].firstChild.textContent;
        };

        updateDivs();
        setInterval(updateDivs, 1000);

        if (
            $lastMessage &&
            $inputBox === document.activeElement &&
            $inputBox.textContent === ""
        ) {
            document.onkeydown = (e) => {
                if (e.key === "ArrowUp") {
                    $inputBox.textContent = $lastMessage;
                }
            };
        }
    };
};
