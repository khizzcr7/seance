# Seance

An offline seance terminal that channels the spirits of dead programming languages.

Pick a spirit, COBOL, FORTRAN, Pascal, BASIC, Lisp, or Ada, and ask it questions. A local open-weight model answers in that language's voice, with period flavour where it comes naturally. Or light an *ofrenda*: name a retired technology and the model composes a short remembrance for it.

## Theme interpretation

Hacktoberfest Week 4 is "Ghost in the Machine": build something with open-source AI at its core, something spooky, or something that honours the past in the spirit of Dia de los Muertos. Seance does both at once: a spooky seance, and a remembrance for the languages and machines that built modern computing and were then retired. Every answer comes from a model running on your own machine, not from a cloud API.

## Run it

Requirements: Node.js 22 or newer. No account, no API key, no paid service.

```sh
npm install
npm run seance   # interactive: pick a spirit, ask questions
npm run demo     # fixed demo: 2 questions to COBOL + 1 ofrenda, writes out/transcript.md
```

First run downloads the model once (Gemma 3 1B, quantised q4, about 840 MB) into `./.cache`. After that everything works offline. The demo also refreshes `viewer/index.html` with the fresh transcript.

In the interactive terminal, type `ofrenda <technology>` for a remembrance, for example `ofrenda the dial-up modem`, and `quit` to leave the circle.

## The static viewer

`viewer/index.html` is plain HTML, CSS, and JS with no build step. It shows the real transcript from the last `npm run demo` and explains how to run the project locally. It does not run the model in the visitor's browser; that claim would be false, so it is not made. The viewer is the live demo link.

## Model and licence notes

- Model: Gemma 3 1B instruction-tuned, `onnx-community/gemma-3-1b-it-ONNX`, open weights under the Gemma licence, run locally through Transformers.js (`@huggingface/transformers`) at dtype q4.
- If Gemma ever fails to load or generate on your machine, set `MODEL_ID=onnx-community/Qwen2.5-0.5B-Instruct` (also dtype q4) and say so in your transcript header. Do not silently swap models.
- Code in this project is MIT licensed (see LICENSE). The model weights are under their own licence, linked above.
- Environment overrides: `MODEL_ID`, `MODEL_DTYPE`, `SEANCE_CACHE_DIR`.

## Honest limits

- A 1B quantised model is small. Answers can ramble, repeat themselves, or drift out of character. The demo transcript is kept verbatim, warts and all, so you can judge it fairly.
- Spirits are in-character fiction. Nothing a spirit says is a fact about a real person, and nothing it says about a language's history should be quoted as a source.
- The ofrenda remembrances are sincere in tone but generated; they are not historical records.
- Generation speed depends on your CPU. The demo takes a few minutes on an ordinary laptop.

## Files

- `src/spirits.js` - the six spirit personas
- `src/model.js` - local model loading and generation
- `src/cli.js` - the interactive terminal (`npm run seance`)
- `src/demo.js` - the fixed demo (`npm run demo`)
- `viewer/index.html` - the static transcript viewer
- `out/transcript.md` - the real demo transcript
