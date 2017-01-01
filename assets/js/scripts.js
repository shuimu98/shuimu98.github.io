// dl-menu options
$(function() {
  $( '#dl-menu' ).dlmenu({
    animationClasses : { classin : 'dl-animate-in', classout : 'dl-animate-out' }
  });
});
// Need this to show animation when go back in browser
window.onunload = function() {};

// Add lightbox class to all image links
//$("a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif']").addClass("image-popup");

// FitVids options
$(function() {
  $(".content").fitVids();
});

// All others
$(document).ready(function() {
    // zoom in/zoom out animations
    if ($(".container").hasClass('fadeOut')) {
        $(".container").removeClass("fadeOut").addClass("fadeIn");
    }
    if ($(".wrapper").hasClass('fadeOut')) {
        $(".wrapper").removeClass("fadeOut").addClass("fadeIn");
    }
    $(".zoombtn").click(function() {
        $(".container").removeClass("fadeIn").addClass("fadeOut");
        $(".wrapper").removeClass("fadeIn").addClass("fadeOut");
    });
    // go up button
    $.goup({
        trigger: 500,
        bottomOffset: 25,
        locationOffset: 20,
        containerRadius: 0,
        containerColor: '#fff',
        arrowColor: '#000',
        goupSpeed: 'normal'
    });
	  //$('.image-popup').magnificPopup({
    //type: 'image',
    //tLoading: 'Loading image #%curr%...',
    //gallery: {
    //  enabled: true,
    //  navigateByImgClick: true,
    //  preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    //},
    //image: {
    //  tError: '<a href="%url%">Image #%curr%</a> could not be loaded.',
    //},
    //removalDelay: 300, // Delay in milliseconds before popup is removed
    //// Class that is added to body when popup is open. 
    //// make it unique to apply your CSS animations just to this exact popup
    //mainClass: 'mfp-fade'
    //});
    $("[class='header']").each(function(i){
        $(this).find('img').each(function(){
          if ($(this).parent().hasClass('fancybox')) return;
          var alt = this.alt;
          if (alt) $(this).after('<span class="pic-title">' + alt + '</span>');
          $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
        });
        $(this).find('.fancybox').each(function(){
          $(this).attr('rel', 'article' + i);
        });
    });
    if($.fancybox){
        $('.fancybox').fancybox();
    };
    //sidebar active
    if($('.search-form').hasClass('active')){
      switch(e.key) {
        case "Esc":
          $('.icon-remove-sign').trigger('click');
          break;
      }
    };
    // Search
    var bs = {
      close: $(".icon-remove-sign"),
      searchform: $(".search-form"),
      canvas: $("body"),
      dothis: $('.dosearch')
    };

    bs.dothis.on('click', function() {
      $('.search-wrapper').toggleClass('active');
      bs.searchform.toggleClass('active');
      bs.searchform.find('input').focus();
      bs.canvas.toggleClass('search-overlay');
      $('.search-field').simpleJekyllSearch();
    });

    bs.close.on('click', function() {
      $('.search-wrapper').toggleClass('active');
      bs.searchform.toggleClass('active');
      bs.canvas.removeClass('search-overlay');
    });
});