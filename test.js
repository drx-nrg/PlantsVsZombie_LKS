const object1 = {
    x: 10,
    y: 50,
    width: 100,
    height: 100
}

const object2 = {
    x: 70,
    y: 100,
    width: 100,
    height: 100
}

function calculateDistance(object1, object2){
    const a = Math.pow(Math.abs(object2.x - object1.x), 2);
    const b = Math.pow(Math.abs(object2.y - object1.y), 2);
    return Math.sqrt(a + b);
}