Vue.config.productionTip = false;
Vue.config.devtools = false;

const DB_NAME = 'tododb';
const DB_VERSION = 1;

const app = new Vue({
  el: '#app',
  data: {
    // form data
    course: '',
    task: '',
    priority: '',
    duedate: '',
    // database data
    db:null,
    ready:false,
    addDisabled:false,
    todos:[]
  },
  async created() {
	  this.db = await this.getDb();
	  this.todos = await this.getTodosFromDb();
	  this.ready = true;
  },
  methods: {
    async addTodo() {
      this.addDisabled = true;
      // random todo for now
      let todo = {
        course: this.course,
        task: this.task,
        priority: this.priority,
        duedate: this.duedate
      };
      console.log('about to add '+ JSON.stringify(todo));
      await this.addTodoToDb(todo);
      this.todos = await this.getTodosFromDb();
      this.addDisabled = false;      
    },
    async deleteTodo(id) {
      await this.deleteTodoFromDb(id);
      this.todos = await this.getTodosFromDb();      
    },
    async addTodoToDb(todo) {
      return new Promise((resolve, reject) => {

      let trans = this.db.transaction(['todos'],'readwrite');
      trans.oncomplete = e => {
        resolve();
      };

      let store = trans.objectStore('todos');
      store.add(todo);
      });
    },
    async deleteTodoFromDb(id) {
      return new Promise((resolve, reject) => {
      let trans = this.db.transaction(['todos'],'readwrite');
      trans.oncomplete = e => {
        resolve();
      };

      let store = trans.objectStore('todos');
      store.delete(id);
      });
    },
    async getTodosFromDb() {
      return new Promise((resolve, reject) => {

        let trans = this.db.transaction(['todos'],'readonly');
        trans.oncomplete = e => {
          resolve(todos);
        };
        
        let store = trans.objectStore('todos');
        let todos = [];
        
        store.openCursor().onsuccess = e => {
          let cursor = e.target.result;
          if (cursor) {
            todos.push(cursor.value)
            cursor.continue();
          }
        };

      });
    },
    async getDb() {
      return new Promise((resolve, reject) => {

        let request = window.indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = e => {
          console.log('Error opening db', e);
          reject('Error');
        };

        request.onsuccess = e => {
          resolve(e.target.result);
        };
        
        request.onupgradeneeded = e => {
          console.log('onupgradeneeded');
          let db = e.target.result;
          let objectStore = db.createObjectStore("todos", { autoIncrement: true, keyPath:'id' });
        };
      });
    }
  }
})
