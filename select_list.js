// A concern here is the initial state -- I think the default should be just
// that there is no initial state -- the user must click to update the state
// -- the reason is, if there is an initial state, the underlying selector's
// state may be different on render, and there will be a gap until onload 
// while the states mismatch -- if the user is fast enough to click a form 
// in that time, they will get unexpected results.

(function(){

  function SelectList(select_element, list_element){
    this.classes = {"selected" : "mw_list_item_selected"};
    this.select = select_element;
    this.list = list_element;
    this.initialize();
  }

  SelectList.prototype.initialize = function() {
    x$(this.list).click(function(obj){return function(evt){obj.trigger_option(evt)}}(this));  
  }

  SelectList.prototype.trigger_option = function(event) {
    var selected_list_option = event.target;
    var value = "";
    var self = this;
    x$().iterate(
      this.list.children,
      function(element, index){
        if(element == selected_list_option) {
          x$(element).addClass(self.classes["selected"]);
          value = x$(element).attr("value");
        } else {
          x$(element).removeClass(self.classes["selected"]);
        }
      }
    );

    //  x$(this.select).attr("value",value); //Odd - this doesn't work, but the following line does
    // -- I think 'value' is a special attribute ... its not in the attributes[] property of a node
    this.select.value = value;

    return true;
  }


  function SelectListLoader(){
    this.SelectLists = {};
    // Keep instances here because we may need them in the future
    // - In v1 we had to listen for changes on the <select>'s and update appropriately
    // - Sometimes we had to listen for different events
  }

  SelectListLoader.prototype.initialize = function() {
    var select_lists = x$().find_elements('select-list');
    var self = this;
    for (name in select_lists) {
      var select_list = select_lists[name];
      self.SelectLists[name] = new SelectList(select_lists[name]["select"],select_lists[name]["content"]);
    }
  }

  SLL = new SelectListLoader();
  window.addEventListener('load', function(){ SLL.initialize();}, false);

})()