import './style.css'
import {setup} from './todos.ts';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="flex flex-col items-center gap-10">
    <h1 class="text-3xl font-bold ">Automerge Todo</h1>
    <div class="flex justify-center gap-10">
    <input id="input"/>
      <button id="add" type="button">+</button>
    </div>
    <div id="list" class="read-the-docs">
     <h3> List of todos</h3>
    </div>
  </div>
`

setup(
  document.querySelector<HTMLInputElement>('#input')!,
  document.querySelector<HTMLDivElement>('#list')!
)
