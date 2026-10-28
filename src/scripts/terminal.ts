/**
 * Terminal easter egg: the `>_` mark swaps the name label for a tiny shell.
 * It understands `cat <page>` and `exit`; Tab completes, Esc closes.
 */

interface TerminalFile {
  name: string;
  href: string;
  isCurrent: boolean;
}

const PROMPT = 'jeff@notes:~$ ';
const MAX_LINES = 6;
const OPEN_DELAY_MS = 350;

/** Matches `about`, `about.md`, `./about.md`, `posts`, `posts/` ... to a file. */
function findFile(files: TerminalFile[], arg: string): TerminalFile | undefined {
  const name = arg.replace(/^\.\//, '').replace(/\/$/, '');
  return files.find(
    (file) => file.name.replace(/\/$/, '') === name || file.name.split('.')[0] === name,
  );
}

function setUpTerminal(): void {
  const label = document.getElementById('label');
  const terminal = document.getElementById('terminal');
  const egg = document.getElementById('egg');
  const input = terminal?.querySelector('input');
  const output = terminal?.querySelector<HTMLElement>('.output');
  if (!label || !terminal || !egg || !input || !output) return;

  const fileButtons = [...terminal.querySelectorAll<HTMLButtonElement>('[data-file]')];
  const files: TerminalFile[] = fileButtons.map((button) => ({
    name: button.dataset.file ?? '',
    href: button.dataset.href ?? '',
    isCurrent: button.hasAttribute('aria-current'),
  }));

  const open = (): void => {
    label.hidden = true;
    terminal.hidden = false;
    output.replaceChildren();
    input.value = '';
    input.focus();
  };

  const close = (): void => {
    terminal.hidden = true;
    label.hidden = false;
    egg.focus();
  };

  const say = (text: string, kind?: 'echo' | 'error'): void => {
    const line = document.createElement('div');
    line.textContent = text;
    if (kind) line.className = kind;
    output.append(line);
    while (output.children.length > MAX_LINES) output.firstChild?.remove();
  };

  const cat = (arg: string): void => {
    if (!arg) return say('cat: which file? try cat about.md', 'error');
    const file = findFile(files, arg);
    if (!file) return say(`cat: ${arg}: No such file or directory`, 'error');
    if (file.isCurrent) return say("you're already reading it :)");
    say(`opening ${file.name} ...`);
    setTimeout(() => location.assign(file.href), OPEN_DELAY_MS);
  };

  const run = (line: string): void => {
    say(PROMPT + line, 'echo');
    const [command, ...rest] = line.trim().split(/\s+/);
    if (!command) return;
    if (command === 'exit') return close();
    if (command === 'cat') return cat(rest.join(' '));
    say(`${command}: command not found. try cat <file> or exit`, 'error');
  };

  const complete = (): void => {
    const match = input.value.match(/^cat\s+(\S*)$/);
    if (!match) return;
    const hits = files.filter((file) => file.name.startsWith(match[1]));
    if (hits.length === 1) input.value = `cat ${hits[0].name}`;
    else if (hits.length > 1) say(hits.map((file) => file.name).join('  '), 'echo');
  };

  egg.hidden = false;
  egg.addEventListener('click', open);

  for (const button of fileButtons) {
    button.addEventListener('click', () => {
      input.value = `cat ${button.dataset.file}`;
      input.focus();
    });
  }

  terminal.addEventListener('click', (event) => {
    if (event.target === terminal) input.focus();
  });

  input.addEventListener('keydown', (event) => {
    // Keys typed here belong to the terminal, never to the post bar.
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      run(input.value);
      input.value = '';
    } else if (event.key === 'Escape') {
      close();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      complete();
    }
  });
}

setUpTerminal();
