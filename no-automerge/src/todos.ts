import type {TodoItem} from './types';
import {taskList} from './data.ts';

function scrollToBottom(list: HTMLUListElement) {
  // Scroll to the bottom to ensure the latest item is visible
  const parent = list.parentElement as HTMLElement;
  parent.scrollTop = parent.scrollHeight;
}

function updateData(data: TodoItem[]=[]) {
  const tasks = Array.from(document.querySelectorAll("li")).map((liEl) => ({
    contents: liEl.innerText,
    completed: liEl.firstElementChild?.classList.contains("completed")||false
  }));

  data.push(...tasks);
}

function updateListLength(todoList: HTMLUListElement) {
  let count = 0;
  for (let item of todoList.children) {
    if (!item.firstElementChild?.classList.contains("completed")) {
      count++;
    }
  }
  const listLength = document.getElementById("list-length") as HTMLElement;
  listLength.innerText = String(count);
}

function deleteCompletedTasks(todoList: HTMLUListElement) {
  const todoItems = Array.from(todoList.children);
  todoItems.forEach((item) => {
    if (item.firstElementChild?.classList.contains("completed")) {
      item.remove();
    }
  });
  updateData(taskList);
  updateListLength(todoList);
}

function createTaskItem(task: TodoItem, todoList: HTMLUListElement) {
  //Create List Item
  const listItem = document.createElement("li");
  listItem.classList.add("item");

  //Create Span
  const styleSpan = document.createElement("span");

  //Add task text to span
  styleSpan.innerText = task.contents;

  //Append styleSpan to listItem
  listItem.appendChild(styleSpan);
  const firstListElement = listItem.firstElementChild as HTMLUListElement;

  if (task.completed) {
    if(firstListElement) {
      firstListElement.classList.add("completed");
    }
  }

  //Create Completed Button
  const completedBtn = document.createElement("i");
  completedBtn.className = "fa-regular fa-circle";
  completedBtn.addEventListener("click", () => {
    if(firstListElement) {
      firstListElement.classList.toggle("completed");
      if (firstListElement.classList.contains("completed")) {
        completedBtn.classList.remove("fa-regular", "fa-circle");
        completedBtn.classList.add("fa-solid", "fa-circle-check");
      } else {
        completedBtn.classList.remove("fa-solid", "fa-circle-check");
        completedBtn.classList.add("fa-regular", "fa-circle");
      }
    }

    updateData(taskList);
    updateListLength(todoList);

  });

  //Create Delete Button
  const deleteBtn = document.createElement("i");
  deleteBtn.className = "fas fa-times";
  deleteBtn.addEventListener("click", () => {
    listItem.remove();
    updateData(taskList);
    updateListLength(todoList);
  });

  //Prepend/Append Elements
  styleSpan.prepend(completedBtn);
  listItem.appendChild(deleteBtn);
  todoList.appendChild(listItem);
  // Scroll to the bottom after adding the new task
  // Scroll to the bottom after adding the new task
  listItem.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Scroll the control bar into view after adding a task
  const controlBar = document.getElementById("control-bar") as HTMLElement;
  controlBar.scrollIntoView({ behavior: "smooth", block: "end" });

}


export function setup(input:HTMLInputElement , todoList: HTMLUListElement, clearButton: HTMLButtonElement) {
  scrollToBottom(todoList)
  taskList.forEach(task => createTaskItem(task,todoList))
  input.addEventListener("keyup", event => {
    event.preventDefault();
    if (event.key === 'Enter' || event.code === 'Enter') {
      // Do something
      const newTask = input.value;
      createTaskItem({ contents: newTask, completed: false }, todoList);
      input.value = "";
    }
    scrollToBottom(todoList)
  })
  clearButton.addEventListener("click", event => {
    event.preventDefault();
    deleteCompletedTasks(todoList)
  })

  const filterOptions = document.querySelectorAll('input[name=\'filter\']') as unknown as HTMLInputElement[];
  filterOptions.forEach((input: HTMLInputElement) => {
    input.addEventListener("change", () => {
      const filter = input.value;
      const todoItems = Array.from(todoList.children) as HTMLUListElement[];
      todoItems.forEach((item) => {
        switch (filter) {
          case "all":
            item.style.display = "flex";
            break;
          case "completed":
            if (item.firstElementChild?.classList.contains("completed")) {
              item.style.display = "flex";
            } else {
              item.style.display = "none";
            }
            break;
          case "active":
            if (!item.firstElementChild?.classList.contains("completed")) {
              item.style.display = "flex";
            } else {
              item.style.display = "none";
            }
            break;
        }
      });
    })
  })
}
