Data e tempo — política do projeto

Objetivo

Padronizar a representação de datas/horários entre cliente e servidor para evitar bugs de fuso horário (por exemplo: pedidos feitos para a data do dia seguinte quando é tarde da noite no cliente).

Regras principais

1. Inputs do usuário

- Use `input[type="date"]` para escolher apenas a data.
- Use `input[type="datetime-local"]` para escolher data + hora em horário local (sem informação de fuso na string).

2. No frontend (browser)

- Para exibir valores em campos `datetime-local` use `formatDateTimeLocal(date: Date)` (fornecido em `src/lib/date.ts`) que gera `YYYY-MM-DDTHH:mm` em timezone local.
- Para consultar endpoints por dia (por exemplo `/api/working-hours?date=YYYY-MM-DD`) use `formatDateLocal(date: Date)` que gera `YYYY-MM-DD` baseado no dia local do usuário.
- Nunca envie diretamente o valor `datetime-local` (string) sem convertê-lo em um instante ISO: antes de enviar ao servidor, converta com `parseDateTimeLocal(value).toISOString()` para obter um instant UTC ISO (`2025-10-01T20:00:00.000Z`).

3. No servidor (API)

- A API espera timestamps no formato ISO (com timezone), ex.: `2025-10-01T20:00:00.000Z`.
- O servidor interpreta instantes como UTC (objetos Date) e realiza validações de horário com métodos UTC (ex.: `getUTCHours()`) para manter consistência.

4. Utilitários disponíveis

- `src/lib/date.ts`:
  - `formatDateLocal(d: Date)` -> `YYYY-MM-DD`
  - `formatDateTimeLocal(d: Date)` -> `YYYY-MM-DDTHH:mm` (para `datetime-local` inputs)
  - `parseDateTimeLocal(s: string)` -> `Date` (interpreta `YYYY-MM-DDTHH:mm` como horário local)

5. Boas práticas

- Sempre converta valores `datetime-local` para ISO antes de enviar (ex.: `parseDateTimeLocal(value).toISOString()`).
- Prefira enviar instantes ISO ao servidor; mantenha o formato local apenas para exibição/inputs.
- Ao debugar problemas de data, logue o valor local (`date.toString()`), o ISO (`date.toISOString()`), e o valor enviado para a API.

Exemplos

1. Exibir um Date no campo datetime-local

const inputValue = formatDateTimeLocal(date);

2. Enviar um payload ao servidor

const iso = parseDateTimeLocal(form.date).toISOString();
fetch('/api/appointments', { method: 'POST', body: JSON.stringify({ startTime: iso }) });

Notas

- Essas regras minimizam ambiguidades entre hora local e hora UTC. O servidor sempre trabalha com instantes (UTC) — a conversão local->ISO é responsabilidade do cliente antes do envio.
