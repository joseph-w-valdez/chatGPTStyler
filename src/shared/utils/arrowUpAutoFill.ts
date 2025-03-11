const messageBubbles = '[data-testid^="conversation-turn-"]';

export const arrowUpAutoFill = (): void => {
    const $main = document.querySelector("main");

    $main?.addEventListener("keydown", (e: KeyboardEvent) => {
        const $inputBox = document.getElementById(
            "prompt-textarea",
        ) as HTMLTextAreaElement;

        if (e.target === $inputBox && e.key === "ArrowUp") {
            e.preventDefault();
            const $lastMessageContainer = document.querySelector(
                `:nth-last-child(2 of ${messageBubbles}) [data-message-author-role="user"] > div `,
            ) as HTMLElement | null;
            if ($lastMessageContainer) {
                const $lastMessage = $lastMessageContainer.textContent;
                if ($lastMessage) {
                    $inputBox.innerText = $lastMessage;
                    $inputBox.scrollTop = $inputBox.scrollHeight;
                    $inputBox.style.overflow = "unset";
                }
            }
        }
    });
};
