import type {TodoItem} from './types';
// import {taskList} from './data.ts';
import {broadcast, getOrCreateHandle} from './handle-automerge.ts';

// Get or create the document
const rootDocUrl = document.location.hash.substring(1);

const handle = getOrCreateHandle(rootDocUrl);

// Update the URL in the browser
document.location.hash = handle.url;

function scrollToBottom(list: HTMLUListElement) {
  // Scroll to the bottom to ensure the latest item is visible
  const parent = list.parentElement as HTMLElement;
  parent.scrollTop = parent.scrollHeight;
}



function updateListLength(tasks: TodoItem[]) {
  tasks = tasks.filter(task => !task.completed);
  let count = tasks.length;
  const listLength = document.getElementById('list-length') as HTMLElement;
  listLength.innerText = String(count);
}


const findTodos = async () => {
  const doc = await handle.doc();
  return doc?.tasks;
};

const updateTodo = (index: any, newValue: TodoItem) => {
  handle.change((doc) => {
    doc.tasks.splice(index, 1, newValue);
  });
}

const deleteTodo = (index: any) => {
  handle.change((doc) => {
    doc.tasks.splice(index, 1);
  });
}

const deleteCompletedTasks = () => {
  handle.change((doc) => {
    // Iterate over the tasks array in reverse to avoid index issues when splicing
    for (let i = doc.tasks.length - 1; i >= 0; i--) {
      const task = doc.tasks[i];
      // Remove task if completed
      if (task.completed) {
        doc.tasks.splice(i, 1); // Remove completed task at index i
      }
    }
  });
};



function createTaskItem(index: number,task: TodoItem, todoList: HTMLUListElement) {
  //Create List Item
  const listItem = document.createElement('li');
  listItem.classList.add('item');

  //Create Span
  const styleSpan = document.createElement('span');

  //Add task text to span
  styleSpan.innerText = task.contents;

  //Append styleSpan to listItem
  listItem.appendChild(styleSpan);
  const firstListElement = listItem.firstElementChild as HTMLUListElement;

  if (task.completed) {
    if (firstListElement) {
      firstListElement.classList.add('completed');
    }
  }



  //Create Completed Button
  const completedBtn = document.createElement('i');
  completedBtn.className = 'fa-regular fa-circle';
  if (firstListElement.classList.contains('completed')) {
    completedBtn.classList.remove('fa-regular', 'fa-circle');
    completedBtn.classList.add('fa-solid', 'fa-circle-check');
  } else {
    completedBtn.classList.remove('fa-solid', 'fa-circle-check');
    completedBtn.classList.add('fa-regular', 'fa-circle');
  }


  completedBtn.addEventListener('click', async () => {
    const updatedTask = Object.assign({}, {...task, completed: !task.completed});
    updateTodo(index, updatedTask)
    await renderTasks(todoList);
  });

  //Create Delete Button
  const deleteBtn = document.createElement('i');
  deleteBtn.className = 'fas fa-times';
  deleteBtn.addEventListener('click', async () => {
    deleteTodo(index)
    await renderTasks(todoList);
  });

  //Prepend/Append Elements
  styleSpan.prepend(completedBtn);
  listItem.appendChild(deleteBtn);
  todoList.appendChild(listItem);
  // Scroll to the bottom after adding the new task
  // Scroll to the bottom after adding the new task
  listItem.scrollIntoView({behavior: 'smooth', block: 'nearest'});

  // Scroll the control bar into view after adding a task
  const controlBar = document.getElementById('control-bar') as HTMLElement;
  controlBar.scrollIntoView({behavior: 'smooth', block: 'end'});

}


const renderTasks = async (todoList: HTMLUListElement) => {
  let tasks: TodoItem[] = await findTodos();
  todoList.innerHTML = '';
  updateListLength(tasks);
  tasks.forEach((task, index) => createTaskItem(index,task, todoList));
};

export async function setup(input: HTMLInputElement, todoList: HTMLUListElement, clearButton: HTMLButtonElement) {
  scrollToBottom(todoList);
  await renderTasks(todoList);
  input.addEventListener('keyup', async (event) => {
    event.preventDefault();
    if (!(event.key === 'Enter' || event.code === 'Enter')) return;
    // Do something
    const newTask = input.value;
    handle.change((doc) => {
      doc.tasks.push({contents: newTask, completed: false});
    });
    input.value = '';
    await renderTasks(todoList);
    scrollToBottom(todoList);
  });
  clearButton.addEventListener('click', async event => {
    event.preventDefault();
    deleteCompletedTasks();
    await renderTasks(todoList);
  });

  const filterOptions = document.querySelectorAll('input[name=\'filter\']') as unknown as HTMLInputElement[];
  filterOptions.forEach((input: HTMLInputElement) => {
    input.addEventListener('change', () => {
      const filter = input.value;
      const todoItems = Array.from(todoList.children) as HTMLUListElement[];
      todoItems.forEach((item) => {
        switch (filter) {
          case 'all':
            item.style.display = 'flex';
            break;
          case 'completed':
            if (item.firstElementChild?.classList.contains('completed')) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
            break;
          case 'active':
            if (!item.firstElementChild?.classList.contains('completed')) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
            break;
        }
      });
    });
  });

  broadcast.on('message', async () => {
    await renderTasks(todoList); // Re-render on BroadcastChannel changes
  });
}
