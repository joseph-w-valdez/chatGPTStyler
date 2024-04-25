import { messageBubbles } from "./stylingFunctions";

export const arrowUpAutoFill = (): void => {
    const $main = document.querySelector("main");

    $main?.addEventListener("keydown", (e: KeyboardEvent) => {
        const $inputBox = document.getElementById(
            "prompt-textarea",
        ) as HTMLTextAreaElement | null;

        if (e.target === $inputBox && e.key === "ArrowUp") {
            e.preventDefault();

            if ($inputBox) {
                const $lastMessageContainer = document.querySelector(
                    `:nth-last-child(2 of ${messageBubbles}) [data-message-author-role="user"] > div`,
                ) as HTMLElement | null;

                if ($lastMessageContainer) {
                    const $lastMessage = $lastMessageContainer.textContent;

                    if ($lastMessage) {
                        $inputBox.value = $lastMessage;
                        $inputBox.scrollTop = $inputBox.scrollHeight;
                        $inputBox.style.overflow = "unset";
                    }
                }
            }
        }
    });
};
