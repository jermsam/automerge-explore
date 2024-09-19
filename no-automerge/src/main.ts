import './style.css'
import {setup} from './todos.ts';
import '@fortawesome/fontawesome-free/css/all.min.css';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="bg-[url('assets/bg-mobile-dark.jpg')] md:bg-[url('assets/bg-desktop-dark.jpg')] bg-cover bg-no-repeat h-[30%] ">
    <div class="h-full px-4 max-w-xl mx-auto flex flex-col items-center justify-center">
   <header class="flex w-full  justify-between gap-10 items-center mt-[2rem] mb-[1rem]">
      <h1 class="text-gray-50  text-xl md:text-2xl font-bold">AUTOMERGE TODO</h1>
      <span class="inline-block w-6 h-6 bg-[url('assets/sun.svg')] bg-contain bg-no-repeat"></span>
    </header>
     <main class="relative w-full">
      <div class="relative todo-form">
        <input
          id="todo-input"
          type="text"
          class="w-full bg-[rgb(37,39,60)] px-12 py-4 rounded-[5px] border-0 focus:text-[hsl(234,39%,85%)]"
          placeholder="Create a new todo..."
        />
      </div>
       <section class="absolute mt-8 w-full">
       <ul id="todo-list" class="flex flex-col gap-2 bg-[rgb(37,39,60)] rounded"></ul>
        <div class="flex list-info justify-between items-center bg-[hsl(235,24%,19%)] text-[rgb(119,122,146)] text-[0.8rem] p-4 rounded-[5px]">
          <p><span id="list-length" class="length-num">0</span>items left</p>
          <button id="clear-btn">Clear Completed</button>
        </div>
        <div class="bg-[hsl(235,24%,19%)] flex justify-evenly items-center text-[rgb(119,122,146)] my-1 px-12 py-4 rounded-[5px] border-t-[rgb(119,122,146,0.3)] border-t border-solid">
          <input class="absolute opacity-0 w-0 h-0" type="radio" id="radioAll" name="filter" value="all" />
          <label class="cursor-pointer hover:text-[hsl(220, 98%, 61%)]" for="radioAll">All</label>
          <input class="absolute opacity-0 w-0 h-0" type="radio" id="radioActive" name="filter" value="active" />
          <label class="cursor-pointer hover:text-[hsl(220, 98%, 61%)]" for="radioActive">Active</label>
          <input
          class="absolute opacity-0 w-0 h-0"
            type="radio"
            id="radioCompleted"
            name="filter"
            value="completed"
          />
          <label class="cursor-pointer hover:text-[hsl(220, 98%, 61%)]" for="radioCompleted">Completed</label>
        </div>
       </section>
     </main>

    </div>
  </div>
`

setup(
  document.querySelector<HTMLInputElement>('#todo-input')!,
  document.querySelector<HTMLLIElement>('#todo-list')!,
  document.querySelector<HTMLButtonElement>('#clear-btn')!
)
