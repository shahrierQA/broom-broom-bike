$('#reviewCarousel').owlCarousel({
  loop: true,
  margin: 0,
  autoplay: true,
  autoHeight: true,
  autoplayTimeout: 8000,
  smartSpeed: 800,
  nav: true,
  dots: false,
  responsive: {
    0: {
      items: 1,
    },
    600: {
      items: 1,
    },
    1000: {
      items: 1,
    },
  },
});

$(function () {
  $('.tabs-nav a').click(function () {
    // Check for active
    $('.tabs-nav li').removeClass('active');
    $(this).parent().addClass('active');

    // Display active tab
    let currentTab = $(this).attr('href');
    $('.tabs-content .tab-box').hide();
    $(currentTab).show();

    return false;
  });
});

function imageData(url) {
  const originalUrl = url || '';
  return {
    previewPhoto: originalUrl,
    fileName: null,
    emptyText: originalUrl ? 'No new file chosen' : 'No file chosen',
    updatePreview($refs) {
      var reader,
        files = $refs.input.files;
      reader = new FileReader();
      reader.onload = e => {
        this.previewPhoto = e.target.result;
        this.fileName = files[0].name;
      };
      reader.readAsDataURL(files[0]);
    },
    clearPreview($refs) {
      $refs.input.value = null;
      this.previewPhoto = originalUrl;
      this.fileName = false;
    },
  };
}

$('.bike__sorting-nav').on('click', function () {
  $('.bike__sorting-menu').slideToggle(280);
});
