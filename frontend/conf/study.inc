location /study/ {
    alias /usr/share/nginx/study/;

    autoindex on;
    autoindex_exact_size off;   # Shows sizes in KB, MB, GB instead of bytes
    autoindex_localtime on;

    fancyindex on;
    fancyindex_localtime on;
    fancyindex_exact_size off;

    #fancyindex_header "/Nginx-Fancyindex-Theme-dark/header.html";
    #fancyindex_footer "/Nginx-Fancyindex-Theme-dark/footer.html";

    fancyindex_ignore "Nginx-Fancyindex-Theme-light"; # Making sure folder where files are don't show up in the listing. 
    fancyindex_ignore "Nginx-Fancyindex-Theme-dark"; # Making sure folder where files are don't show up in the listing. 
    # Warning: if you use an old version of ngx-fancyindex, comment the last line if you
    # encounter a bug. See https://github.com/Naereen/Nginx-Fancyindex-Theme/issues/10
    fancyindex_name_length 255;
}
