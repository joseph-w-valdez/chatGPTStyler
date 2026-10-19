// Trimmed from a real chatgpt.com conversation (app-shell layout, Oct 2026).
// Structure, attributes, and class names are kept; message text is not.

const turn = (index: number, withBubble: boolean): string => `
<div data-turn-key="bbb2112${index}-3c86-429a-9cb8-c254560b1f72">
  <div data-content-search-turn-key="fallback-turn-${index}">
    <div class="group flex flex-col" data-talvt-turn-state="complete">
      <div class="block-BQZwFn">
        <h4 class="sr-only">You said:</h4>
        <div class="group/user-message flex flex-col items-end gap-2" data-chatgpt-search-unit-key="fallback-turn-${index}:0:user">
          <div class="w-full" data-content-search-unit-key="fallback-turn-${index}:0:user">
            <div class="group/user-message flex w-full flex-col gap-1 items-end">
              ${
                  withBubble
                      ? '<div data-user-message-bubble="true" class="bg-user-message text-user-message max-w-(--user-chat-width) bubble-vBnidZ rounded-2xl">question</div>'
                      : ""
              }
            </div>
          </div>
        </div>
      </div>
      <div class="block-BQZwFn">
        <span hidden="" data-chatgpt-agent-turn-start=""></span>
        <div data-content-search-unit-key="fallback-turn-${index}:1:assistant" data-chatgpt-search-unit-key="fallback-turn-${index}:1:assistant">
          <h4 class="sr-only m-0" data-conversation-role="assistant">ChatGPT said:</h4>
          <div>
            <div class="group flex min-w-0 flex-col" data-chatgpt-selection-message-id="6365aeaa-43f6-4c2a-b806-ceb44e54e01${index}">
              <div data-markdown-text-style="assistant-message" class="MarkdownRoot-rZKhxa"><p>answer</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-1.5 flex turn-action-controls max-w-(--thread-content-max-width)"></div>
  </div>
</div>`;

export const APP_SHELL_CONVERSATION = `
<style id="custom-style"></style>
<div id="root">
  <aside class="app-shell-left-panel">
    <div id="app-shell-sidebar">
      <div inert="">
        <nav aria-label="Show sidebar" data-app-navigation-rail="true">
          <button type="button" aria-label="Open profile menu" aria-haspopup="menu" data-state="closed"></button>
        </nav>
      </div>
      <div class="absolute inset-0 flex bg-surface">
        <nav role="navigation" aria-label="Chat history">
          <div data-sidebar-chatgpt-conversation-key="chatgpt:conversation:6ad649f1-d724-83e8-80fc-c37c3fb949ab" role="listitem">
            <a data-interactive-row-link="true" href="/c/6ad649f1-d724-83e8-80fc-c37c3fb949ab" data-discover="true">One</a>
          </div>
          <div data-sidebar-chatgpt-conversation-key="chatgpt:conversation:6ad560b0-af40-83e8-a4d4-56b02b4ff1d6" role="listitem">
            <a data-interactive-row-link="true" href="/c/6ad560b0-af40-83e8-a4d4-56b02b4ff1d6" data-discover="true">Two</a>
          </div>
        </nav>
        <div class="absolute inset-x-0 bottom-0 z-20">
          <button class="absolute inset-0" aria-label="Open profile menu" type="button" aria-haspopup="menu" data-state="closed"></button>
        </div>
      </div>
    </div>
  </aside>
  <main class="outline-none MainContentSurface-EnuIYE" data-app-shell-main-surface="browser">
    <div data-request-input-activity-root="true" class="relative h-full">
      <div data-app-action-timeline-scroll="" class="thread-scroll-container overflow-y-auto" role="region" aria-label="Conversation">
        <div data-thread-user-message-navigation-content="true" class="relative flex mx-auto w-full max-w-(--thread-body-max-width)">
          ${turn(0, true)}
          ${turn(1, false)}
          ${turn(2, true)}
        </div>
      </div>
      <div class="pointer-events-none absolute inset-x-0 z-20 bottom-0" data-thread-scroll-footer="true">
        <div class="relative z-10 flex flex-col mx-auto w-full max-w-(--thread-body-max-width)" data-pip-obstacle="thread-footer">
          <div class="relative h-0">
            <button class="group/scroll-to-bottom absolute z-30 flex h-8 w-8" aria-hidden="true" aria-label="Scroll to bottom" type="button" tabindex="-1"></button>
          </div>
          <form class="relative flex flex-col gap-2" data-composer-placement="thread" data-chatgpt-composer="" data-thread-find-composer="true">
            <div contenteditable="true" role="textbox" class="ProseMirror" aria-label="Ask ChatGPT"></div>
          </form>
        </div>
      </div>
    </div>
  </main>
</div>`;
