import './style.css'
import {setup} from './todos.ts';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Automerge Todo</h1>
    <div style="display: flex; gap: 2px; justify-content: center;">
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
