import { Component, Injector, computed, effect,  inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from "./../../models/tasks.model"

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  tasks = signal<Task[]>([
    {
      id: Date.now(),
      title: 'Crear Proyecto',
      completed: false,
      editing: false
    },
    {
      id: Date.now() + 1,
      title: 'Crear Componentes',
      completed: false,
      editing: false
    },
  ]);

  filter = signal< 'all' | 'pending' | 'completed'>('all');
  taskByFilter = computed(()=>{
    const filter = this.filter();
    const tasks = this.tasks();
    if(filter === 'pending'){
      return tasks.filter(task => !task.completed);
    }
      if(filter === 'completed'){
      return tasks.filter(task => task.completed);
    }
    return tasks;
  })

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  });

  injector = inject(Injector)

  ngOnInit(){
    const storage = localStorage.getItem('tasks');
    if(storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTask();
  }

trackTask() {
  effect(() => {
    const tasks = this.tasks();
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, { injector: this.injector });
}


  changeHandler() {
    if (this.newTaskCtrl.valid) {
      const value = this.newTaskCtrl.value.trim();
      if (value !== '') {
        this.addTask(value);
        this.newTaskCtrl.setValue('');
      }
    }
  }

  addTask(title: string) {
    const newTask: Task = {
      id: Date.now(),
      title,
      completed: false,
      editing: false
    };
    this.tasks.update(tasks => [...tasks, newTask]);
  }

  deleteTask(index: number) {
    this.tasks.update(tasks => tasks.filter((_, position) => position !== index));
  }

updateTask(index: number) {
  this.tasks.update(tasks =>
    tasks.map((task, position) =>
      position === index
        ? { ...task, completed: !task.completed }
        : task
    )
  );
}


updateTaskEditingMode(index: number) {
  this.tasks.update(tasks =>
    tasks.map((task, position) =>
      position === index
        ? { ...task, editing: !task.editing }
        : task
    )
  );
}

updateTaskText(index: number, event: Event) {
  const input = event.target as HTMLInputElement;

  this.tasks.update(prevState => {
    return prevState.map((task, position) => {
      if (position === index) {
        return {
          ...task,
          title: input.value,
          editing: false
        };
      }
      return task;
    });
  });
}

changeFilter(filter: 'all' | 'pending' | 'completed'){
  this.filter.set(filter);
}
}