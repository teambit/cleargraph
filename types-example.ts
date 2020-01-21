class AbstractClass<T> {
    constructor(readonly data: T){}
    getVal(): T {
        return this.data;
    }
}

const myAbsInstance = new AbstractClass<string>('hello');
myAbsInstance.data;

class SubClass extends AbstractClass<boolean> {
     
}

const mySubInstance = new SubClass(true);
mySubInstance.data;