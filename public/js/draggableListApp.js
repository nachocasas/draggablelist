const API_URL = 'http://localhost:3000/api'

$(function(){

  const container = $('#container');
  const list = container.find('.list');
  const form = container.find('form');
    

  init = function(){
    initHandlers();
    getData(renderList);
  }

  getCounter = function(){
    const itemCount = list.find('ul>li').length;
    return itemCount;
  }

  updateCounter = function(){
    const counterDiv = list.find('.counter');
    counterDiv.text(getCounter());
  }

  initHandlers = function(){
    form.on('submit', function(e){
      e.preventDefault();
      const data = getDataFromForm();
      
      saveData(insertItemInList);
      resetForm(this);
    })

    list.find('ul').sortable({
      revert: false,
      update: function( event, ui ) {
        saveNewOrder();
      }
    });

  }

  resetForm = function(form){
    form.reset();
    $(form).find('.image-preview').html("");
    $(form).find('h3').text('Add');
    $(form).find('input[name=id]').val("");
    $(form).find('input[type=submit]').val('Insert');
  }

  saveNewOrder = function(){
    let orderedIds = []
    list.find('li').each(function(index, item){
      orderedIds.push($(item).attr('data-id'));
    });

    $.ajax({
      url: API_URL + '/saveOrder',
      type: 'post',
      data: JSON.stringify({data : orderedIds }),
      contentType: 'application/json',
      success: function(res){
      },
      error: function(xhr, txtStatus, err){
        console.log(err)
      }
    })
    
  }

  getData = function(renderCallback){
    $.ajax({
      url: API_URL + '/getAll',
      type: 'get',
      contentType: 'json',
      success: function(res){
        renderCallback(res);
      },
      error: function(xhr, txtStatus, err){
        console.log(err)
      }
    })
  }

  saveData = function(renderCallback){
    var data = new FormData($('form')[0]);
    $.ajax({
      url: API_URL + '/save',
      type: 'post',
      enctype: 'multipart/form-data',
      data: data,
      contentType: false,
      processData: false,
      success: function(res){
        getData(renderList)
      },
      error: function(xhr, txtStatus, err){
        console.log(err)
      }
    })
  }

  removeItem = function(id, callback){
    $.ajax({
      url: API_URL + '/delete',
      type: 'post',
      data: JSON.stringify({data : id }),
      contentType: 'application/json',
      success: function(res){
        callback(res);
      },
      error: function(xhr, txtStatus, err){
        console.log(err)
      }
    })
  }

  renderList = function(items){
    list.find('ul').empty();
    items.forEach(function(item) {
      insertItemInList(item);
    });
  }

  getDataFromForm = function(){
    const image = form.find('input[name=file]').prop('files')[0];
    const description = form.find('textarea[name=desc]').val();
    const order = form.find('input[name=order]').val();

    if(order == ''){
      form.find('input[name=order]').val(getCounter() - 1)
    }
    
    const id = form.find('input[name=id]').val();
    return {
      id,
      image,
      description,
      order
    }
  }

  prepareForEdit = function(id){
    $.ajax({
      url: API_URL + '/get/'+id,
      type: 'get',
      contentType: 'json',
      success: function(res){
        populateForm(res);
      },
      error: function(xhr, txtStatus, err){
        console.log(err);
      }
    })
  }

  populateForm = function(data){
    form.find('h3').text('Edit ' + data._id);
    form.find('input[name=id]').val(data._id);
    form.find('input[name=order]').val(data.order);
    form.find('input[type=submit]').val('Update');
    form.find('textarea').val(data.desc);

    const image = $('<img src="uploads/'+ data.img +'"/>')
    form.find('.image-preview').html(image);
  }

  insertItemInList = function(data){
    const li = $('<li data-id="'+data._id+'"></li>');
    const image = $('<span class="image"><img src="/uploads/'+data.img+'" />');
    const desc = $('<span class="description"></span>').text(data.desc);
    const remove = $('<button class="remove">Delete</button>');
    const edit = $('<button class="edit">Edit</button>');
    
    remove.on('click', function(e){
      const parent = $(this).parent('li');
      const id = parent.attr('data-id');
      removeItem(id, function(result){
        parent.remove();
        resetForm(form[0]);
        updateCounter();
      });
    });

    edit.on('click', function(e){
      const parent = $(this).parent('li');
      const id = parent.attr('data-id');
      prepareForEdit(id);
    });

    li.append(image);
    li.append(desc);
    li.append(edit);
    li.append(remove);
    list.find('ul').append(li);
    updateCounter();
  }

  init();

});