KIJ2013.Learn = function(){
    var TABLE_NAME = "learn",
        baseURL = "learn.php?id=",
        baseId = 'learn-',
        highlight,
        store,

    /**
     * Create Database
     */
    createDatabase = function () {
        store = new Lawnchair({name: TABLE_NAME},function(){});
    },
    onClickLearnItem = function(){
        displayItem($(this).data('guid'));
    },
    displayFoundList = function()
    {
        KIJ2013.setActionBarUp();
        KIJ2013.setTitle('Learn');
        KIJ2013.scrollTop();
        store.all(function(items){
            var len = items.length,
                list;
            if(len)
            {
                list = $('<ul/>').attr('id',"learn-list")
                    .addClass("listview");
                items.sort(KIJ2013.Util.sort("date", false));
                $.each(items, function(index,item){
                    var el, li, title, id;
                    id = item.key;
                    li = $('<li/>').attr('id', baseId+id);
                    title = item.title || "* New item";
                    el = $('<a/>').text(title);
                    el.data('guid', id);
                    el.click(onClickLearnItem);
                    if(id == highlight)
                    {
                        li.addClass('highlight');
                        highlight = null;
                    }
                    li.append(el);
                    list.append(li);
                });
                $('#learn').empty().append(list);
            }
        });
    },
    displayItem = function(guid){
        KIJ2013.setActionBarUp(displayFoundList);
        KIJ2013.scrollTop();
        store.get(guid, function(item){
            if(item)
            {
                var content = $('<div/>').css({"padding": "10px"});
                if(!item.description){
                    KIJ2013.showLoading();
                    loadItem(guid, function(){
                        KIJ2013.hideLoading();
                        displayItem(guid);
                    },function(){
                        KIJ2013.hideLoading();
                        KIJ2013.showError('Sorry, Could not find any '+
                            'information on that item.')
                        displayFoundList();
                    });
                }
                else
                {
                    KIJ2013.setTitle(item.title);
                    $('<h1/>').text(item.title).appendTo(content);
                    content.append(item.description);
                    $('#learn').empty().append(content);
                }
            }
        });
    },
    loadItem = function(id, success, error){
        $.get(baseURL + id, function(data){
            store.get(id, function(item){
                item.title = data.title;
                item.description = data.description;
                store.save(item);
            });
        })
        .success(success)
        .error(error);
    };
    return {
        init: function(){
            createDatabase();
            displayFoundList();
        },
        // Mark an item as found by inserting it into the database
        add: function(id){
            if(!store)
                createDatabase();
            store.get(id, function(item){
                if(!item)
                    store.save({ key: id,
                        date: (new Date())/1000 });
            });
        },
        highlight: function(id){
            var el = $('#'+baseId+id),
                cl = 'highlight';
            if(el.length)
            {
                el.addClass(cl);
                setTimeout(function(){
                    el.removeClass(cl);
                },3000);
            }
            else
                highlight = id;
        }
    }
}();
