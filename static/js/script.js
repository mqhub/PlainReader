/* plugins.css
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.txt for details) */

var unreaditems;

$(document).ready(function(){
    function instapaperText(data) {
        $('#content .body_text').html(data);
        $('#content .body_text a').attr('target', '_blank');
        $('#content header a').unbind('click');
        
        $('#content header a').bind('click', function(event) {
            // TODO: less hacky way to do this?
            var site = $('.selected .ident_site').html();
            var story = $('.selected .ident_story').html();
            var story_obj = unreaditems[story];
            $('#content .body_text').html(story_obj.story_content);
            $('#content header a').unbind('click');
            $('#content header a').bind('click', function(event) {
                $.get('/text?url=' + $('#content header a').attr('href'), instapaperText );
                event.preventDefault();
            });
            event.preventDefault();
        });
    }
    
    function getUnread(json) {
        unreaditems = json.stories;
        
        var list_template = $('#template');   
        for (var i=0; i<unreaditems.length; i++) {
            var site = unreaditems[i].story_feed_id;
            var story_obj = unreaditems[i];                
            var item = list_template.clone();
            
            $(item).attr('id', story_obj.id);
            $(item).removeClass('hidden');

            $('a .site', item).html(story_obj.site_title);
            $('a .date', item).html(story_obj.short_parsed_date);
            $('a .title', item).html(story_obj.story_title);
            $('a .intro', item).html(stripTags(story_obj.story_content).substring(0, 80) + '...');
            
            // TODO: less hacky way to do this?
            $('a .ident_site', item).html(site);
            $('a .ident_story', item).html(i);
            
            $('a', item).bind('click', function() {
                $('#stories ul li').removeClass('selected');

                $(this).parent().addClass('selected');
                var site = $('.ident_site', this).html();
                var story = $('.ident_story', this).html();
                var id = $(this).parent().attr('id');
                
                var story_obj = unreaditems[story];
                
                $('#content').removeClass('hidden');
                $('#pinboard').removeClass('hidden');
                $('#open_in_new_window').removeClass('hidden');
                
                $('#content header time').html(story_obj.long_parsed_date);
                $('#content header h1').html(story_obj.story_title);
                $('#content header .site').html(story_obj.site_title);
                $('#content header .author').html(story_obj.story_authors);
                $('#content .body_text').html(story_obj.story_content);
                $('#content .body_text a').attr('target', '_blank');
                $('#content header a').attr('href', story_obj.story_permalink);
                
                var d;
                if (document.getSelection) {
                    d = document.getSelection();
                } else {
                    d = '';
                }
                
                // TODO: why doesn't description work?
                $('#send_to_instapaper iframe').attr('src', 'http://www.instapaper.com/e2?url='+ encodeURIComponent(story_obj.story_permalink) +'&title=' + encodeURIComponent(story_obj.story_title) + '&description=' + encodeURIComponent(d));
                
                $('#content header a').bind('click', function(event) {
                    $.get('/text?url=' + $('#content header a').attr('href'), instapaperText );
                    event.preventDefault();
                });
                
                $('#content_wrapper')[0].scrollTop = 0;
            });
            
            $(item).appendTo('#stories ul');
        }
    }
    
    function updateFeeds() {
        // stop spinning refresh button
        $('#refresh_wrapper').removeClass('spinning')
        
        // get unread items from server
        $.getJSON('/unread', getUnread);
    }
    
    $('#refresh').bind('click', function() {
        // spin the refresh button to show progress
        $('#refresh_wrapper').addClass('spinning');
        // call refresh on server
        $.get('/refresh', updateFeeds);
        
    });
    
    $('#mark_all_read').bind('click', function() {
        // tell server to mark all as read
        $.get('/all_read');
        // clear the stories list
        $('#stories li').not('#template').remove();
    });

    $('#pinboard').bind('click', function() {
        $('#pinboard_popover').toggleClass('hidden');
    });
    
    $('#send_to_pinboard').bind('click', function() {
        var q, d, p;
        q = $('#content header a').attr('href');
        p = $('#content header h1').html();
        
        // TODO: eliminate this redundancy
        if (document.getSelection) {
            d = document.getSelection();
        } else {
            d = '';
        }

        open('https://pinboard.in/add?showtags=yes&url=' + encodeURIComponent(q) + '&description=' + encodeURIComponent(d) + '&title=' + encodeURIComponent(p), 'Pinboard', 'toolbar=no,width=700,height=600');
        $('#pinboard_popover').addClass('hidden');
    });
    
    $('#send_to_pinboard_read_later').bind('click', function() {
        var q, d, p, t;
        q = $('#content header a').attr('href');
        p = $('#content header h1').html();
        
        // TODO: why doesn't this work either?
        if (document.getSelection) {
            d = document.getSelection();
        } else {
            d = '';
        }
        
        t = open('https://pinboard.in/add?later=yes&noui=yes&jump=close&url=' + encodeURIComponent(q) + '&description=' + encodeURIComponent(d) + '&title=' + encodeURIComponent(p), 'Pinboard', 'toolbar=no,width=100,height=100');
        t.blur();
        $('#pinboard_popover').addClass('hidden');
    });
    
    $('#open_in_new_window').bind('click', function() {
        open($('#content header a').attr('href'));
    });
    
    updateFeeds();
    
    // keyboard shortcuts, etc.
    function nextStory() {
        var next = $('#stories .selected').next();
        if (next.length === 0) {
            next = $('#stories li').first().next();
        }
        $('a', next).trigger('click');
    }
    
    function prevStory() {
        var prev = $('#stories .selected').prev();
        if (prev.length === 0) {
            prev = $('#stories li').first().next();
        }
        $('a', prev).trigger('click');
    }
    
    function key_down(e) {
        if (e.keyIdentifier == 'Down') {
            nextStory();
        }
        
        if (e.keyIdentifier == 'Up') {
            prevStory();
        }
        
        if (e.keyIdentifier == 'Enter') {
            $('#content header a').trigger('click');
        }
    }
    
    $(document).bind('keydown', key_down);
    $('#down').bind('click', nextStory);
    $('#up').bind('click', prevStory);
    
});


















