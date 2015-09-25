Array.prototype.moveUp = function(value, by) {
    var index = this.indexOf(value),
        newPos = index - (by || 1);
    
    if(index === -1)
        throw new Error("Element not found in array");
    
    if(newPos < 0)
        newPos = 0;
        
    this.splice(index,1);
    this.splice(newPos,0,value);
    
    return newPos;
};

Array.prototype.moveDown = function(value, by) {
    var index = this.indexOf(value),
        newPos = index + (by || 1);
    
    if(index === -1)
        throw new Error("Element not found in array");
    
    if(newPos >= this.length)
        newPos = this.length;
    
    this.splice(index, 1);
    this.splice(newPos,0,value);
    
    return newPos;
};
