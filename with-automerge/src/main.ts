import './style.css'
import {setup} from './todos.ts';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Thanks to: https://www.frontendmentor.io/solutions/todo-list-app-vanilla-javascript-scss-vite-QTiJq9-dkD

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div  class=" relative ">
    <div class="h-full  mx-auto flex flex-col items-center justify-center">
     <main class="relative w-full " >
     
       <section id="container" class="absolute  w-full">
          <div class="mb-4 z-10  p-4 sticky top-0 flex flex-col gap-2 bg-[url('assets/bg-mobile-dark.jpg')] md:bg-[url('assets/bg-desktop-dark.jpg')] bg-cover bg-no-repeat bg-center">
           <header class="text-gray-50 max-w-xl mx-auto px-4 flex w-full  justify-between gap-10 items-center mt-[2rem] mb-[1rem]">
            <h1 class="text-xl md:text-2xl font-bold">TODO</h1>
            <div class="flex justify-between items-center gap-5">
             <div class=" flex gap-1 items-center">
                  <buttton id="undoButton" class="rounded-full p-2 cursor-pointer hover:shadow-2xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-opacity-5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
                      <path fill="currentColor" d="M448 440a16 16 0 0 1-12.61-6.15c-22.86-29.27-44.07-51.86-73.32-67C335 352.88 301 345.59 256 344.23V424a16 16 0 0 1-27 11.57l-176-168a16 16 0 0 1 0-23.14l176-168A16 16 0 0 1 256 88v80.36c74.14 3.41 129.38 30.91 164.35 81.87C449.32 292.44 464 350.9 464 424a16 16 0 0 1-16 16"/>
                      </svg>           
                  </buttton>
                  <buttton id="redoButton" class="rounded-full p-2 cursor-pointer hover:shadow-2xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-opacity-5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
                      <path fill="currentColor" d="M48 399.26C48 335.19 62.44 284 90.91 247c34.38-44.67 88.68-68.77 161.56-71.75V72L464 252L252.47 432V329.35c-44.25 1.19-77.66 7.58-104.27 19.84c-28.75 13.25-49.6 33.05-72.08 58.7L48 440Z"/>
                      </svg>            
                  </buttton>        
             </div>
             <buttton id="shareButton" class="rounded-full p-2 cursor-pointer hover:shadow-2xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-opacity-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <g fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <path d="m8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98"/>
                  </g>
              </svg>            
            </buttton>
            </div>

           </header>
          <div class="max-w-xl mx-auto  w-full">
          <input
            id="todo-input"
            type="text"
            class="w-full bg-[rgb(37,39,60)] px-12 py-4 rounded-[5px] border-0 focus:text-[hsl(234,39%,85%)] text-[rgb(119,122,146)]"
            placeholder="Create a new todo..."
          />
          </div>
        </div>
  
          <div  class="flex flex-col overflow-y-auto no-scrollbar h-[78.4vh] max-w-xl mx-auto px-4 ">
                <ul id="todo-list" class="flex flex-col gap-2 bg-[rgb(37,39,60)] rounded "></ul>
                <div id="control-bar" class="flex list-info justify-between items-center bg-[hsl(235,24%,19%)] text-[rgb(119,122,146)] text-[0.8rem] p-4 rounded-[5px]">
                  <p><span id="list-length" class="length-num">0</span>items left</p>
                  <button id="clear-btn">Clear Completed</button>
                </div>
                <div id="filter-bar" class=" z-10 sticky bottom-0 bg-[hsl(235,24%,19%)] flex justify-evenly items-center text-[rgb(119,122,146)] my-1 px-12 py-4 rounded-[5px] border-t-[rgb(119,122,146,0.3)] border-t border-solid">
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
       
          </div>
          
         
          <dialog  id="share-dialog" class="max-w-xl">
            <div  class="flex flex-col items-center gap-5  rounded w-full h-full p-3">
               <div class="w-64 h-64">
                <image id="qr-code" class="w-full h-full object-cover bg-gray-400"/>
               </div>
              <div class="flex justify-between gap-5 max-w-xl">
              
                  <a id="copyQrCode" class="relative cursor-copy inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-md shadow-2xl group">
                  <span class="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-400 group-hover:opacity-100"></span>
                  <!-- Top glass gradient -->
                  <span class="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-5 h-1/3"></span>
                  <!-- Bottom gradient -->
                  <span class="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent opacity-5"></span>
                  <!-- Left gradient -->
                  <span class="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent opacity-5"></span>
                  <!-- Right gradient -->
                  <span class="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent opacity-5"></span>
                  <span class="absolute inset-0 w-full h-full border border-white rounded-md opacity-10"></span>
                  <span class="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-5"></span>
                  <span class="relative text-sm">COPY LINK</span>
                  </a> 
                  
                  <a id="closeQrCode" class="relative cursor-pointer inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-md shadow-2xl group">
                  <span class="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-400 group-hover:opacity-100"></span>
                  <!-- Top glass gradient -->
                  <span class="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-5 h-1/3"></span>
                  <!-- Bottom gradient -->
                  <span class="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent opacity-5"></span>
                  <!-- Left gradient -->
                  <span class="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent opacity-5"></span>
                  <!-- Right gradient -->
                  <span class="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent opacity-5"></span>
                  <span class="absolute inset-0 w-full h-full border border-white rounded-md opacity-10"></span>
                  <span class="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-5"></span>
                  <span class="relative text-sm">CLOSE</span>
                  </a>                      
              </div>
            </div>
          </dialog>
        
       </section>
     </main>

    </div>
  </div>
`

setup(
  document.querySelector<HTMLInputElement>('#todo-input')!,
document.querySelector<HTMLUListElement>('#todo-list')!,
document.querySelector<HTMLButtonElement>('#clear-btn')!
)
