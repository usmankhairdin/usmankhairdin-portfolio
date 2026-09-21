(function($){
    
    $('.side-menu #main-nav ul li i').click(function(){
        $(this).parent('li').find('.sub-menu').slideToggle();
        $(this).parent('li').toggleClass('arrow-up');
        $(this).parent('li').siblings().find('.sub-menu').slideUp();
        $(this).parent('li').siblings().removeClass('arrow-up');
    });
    
    $('.menu-toggler').click(function(){
        $('.side-menu').addClass('open');
    });
    
    $('.close-btn').click(function(){
        $('.side-menu').removeClass('open');
    })
    
    // $("#rateForm").modal('show');


// $(document).on('change', '#city_home ,#pest_area_home,#pest_product_home,#maintanace_type_home', function () {
// }
 



        $(document).on('change', '#pest_area1 ,#pest_product1,#maintanace_type1', function () {
            var pest_area1 = $('#pest_area1').val();
            var pest_product1 = $('#pest_product1').val();
            var maintanace_type = $('#maintanace_type1').val();
            $('#price1').val();
            if (pest_product1 == "Cockroaches" || pest_product1 == "Ticks") {
                //3 Months
                $('#maintanace_type1').children('option[value="Single"]').show();
                $('#maintanace_type1').children('option[value="3 Months"]').hide();
                $('#maintanace_type1').children('option[value="1 Year"]').show();
                $('#maintanace_type1').children('option[value="2 Year"]').show();
            } else if (pest_product1 == "Termites") {
                $('#maintanace_type1').children('option[value="Single"]').hide();
                $('#maintanace_type1').children('option[value="3 Months"]').hide();
            } else if (pest_product1 == "Bed Bugs") {
                $('#maintanace_type1').children('option[value="3 Months"]').show();
                $('#maintanace_type1').children('option[value="1 Year"]').hide();
                $('#maintanace_type1').children('option[value="2 Year"]').hide();
                $('#maintanace_type1').children('option[value="Single"]').hide();
            } else if (pest_product1 == "Mosquitoes") {
                $('#maintanace_type1').children('option[value="3 Months"]').hide();
                $('#maintanace_type1').children('option[value="Single"]').show();
                $('#maintanace_type1').children('option[value="1 Year"]').hide();
                $('#maintanace_type1').children('option[value="2 Year"]').hide();
            } else if (pest_product1 == "Disinfection") {

                $('#maintanace_type1').children('option[value="3 Months"]').hide();
                $('#maintanace_type1').children('option[value="1 Year"]').hide();
                $('#maintanace_type1').children('option[value="2 Year"]').hide();
                $('#maintanace_type1').children('option[value="Single"]').show();
            }

            //Cockroaches Service - single
            if (pest_area1 == "1 RK" && pest_product1 == "Cockroaches" && maintanace_type == "Single") {

                $('#price1').val(1250);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "Single") {

                $('#price1').val(1450);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "Single") {

                $('#price1').val(1700);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "Single") {

                $('#price1').val(1950);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "Single") {

                $('#price1').val(2200);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "Single") {

                $('#price1').val(2500);

            }
            
            
            //Cockroaches Service - 3 Months
            if (pest_area1 == "1 RK" && pest_product1 == "Cockroaches" && maintanace_type == "3 Months") {

                $('#price1').val('');

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "3 Months") {

                $('#price1').val('');

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "3 Months") {

                $('#price1').val('');

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "3 Months") {

                $('#price1').val('');

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "3 Months") {

                $('#price1').val('');

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "3 Months") {

                $('#price1').val('');

            }



            //Cockroaches Service - 1 year
            if (pest_area1 == "1 RK" && pest_product1 == "Cockroaches" && maintanace_type == "1 Year") {

                $('#price1').val(3150);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "1 Year") {

                $('#price1').val(3450);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "1 Year") {

                $('#price1').val(3900);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "1 Year") {

                $('#price1').val(4600);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "1 Year") {

                $('#price1').val(5400);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "1 Year") {

                $('#price1').val(6200);

            }

            //Cockroaches Service - 2 year
            if (pest_area1 == "1 RK" && pest_product1 == "Cockroaches" && maintanace_type == "2 Year") {

                $('#price1').val(5985);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "2 Year") {

                $('#price1').val(6555);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "2 Year") {

                $('#price1').val(7410);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "2 Year") {

                $('#price1').val(8740);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "2 Year") {

                $('#price1').val(10260);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Cockroaches" && maintanace_type == "2 Year") {

                $('#price1').val(11780);

            }


            //Termite  Service - 1 year
            if (pest_area1 == "1 RK" && pest_product1 == "Termites" && maintanace_type == "1 Year") {

                $('#price1').val(4200);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Termites" && maintanace_type == "1 Year") {

                $('#price1').val(4800);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Termites" && maintanace_type == "1 Year") {

                $('#price1').val(5500);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Termites" && maintanace_type == "1 Year") {

                $('#price1').val(6300);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Termites" && maintanace_type == "1 Year") {

                $('#price1').val(7300);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Termites" && maintanace_type == "1 Year") {

                $('#price1').val(8400);

            }


            //Termite  Service - 2 year
            if (pest_area1 == "1 RK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(7350);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(8400);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(9625);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(11025);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(12775);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(14700);

            }
            
             //Termite  Service - 2 year
             if (pest_area1 == "1 RK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(7350);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(8400);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(9625);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(11025);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(12775);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Termites" && maintanace_type == "2 Year") {

                $('#price1').val(14700);

            }


            //Ticks Service - single
            if (pest_area1 == "1 RK" && pest_product1 == "Ticks" && maintanace_type == "Single") {

                $('#price1').val(1400);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Ticks" && maintanace_type == "Single") {

                $('#price1').val(1600);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Ticks" && maintanace_type == "Single") {

                $('#price1').val(1800);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Ticks" && maintanace_type == "Single") {

                $('#price1').val(2100);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Ticks" && maintanace_type == "Single") {

                $('#price1').val(2300);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Ticks" && maintanace_type == "Single") {

                $('#price1').val(2700);

            }


            //Cockroaches Service - 1 year
            if (pest_area1 == "1 RK" && pest_product1 == "Ticks" && maintanace_type == "1 Year") {

                $('#price1').val(3500);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Ticks" && maintanace_type == "1 Year") {

                $('#price1').val(3800);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Ticks" && maintanace_type == "1 Year") {

                $('#price1').val(4200);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Ticks" && maintanace_type == "1 Year") {

                $('#price1').val(4800);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Ticks" && maintanace_type == "1 Year") {

                $('#price1').val(5500);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Ticks" && maintanace_type == "1 Year") {

                $('#price1').val(6200);

            }

            //Cockroaches Service - 2 year
            if (pest_area1 == "1 RK" && pest_product1 == "Ticks" && maintanace_type == "2 Year") {

                $('#price1').val(6650);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Ticks" && maintanace_type == "2 Year") {

                $('#price1').val(7220);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Ticks" && maintanace_type == "2 Year") {

                $('#price1').val(7980);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Ticks" && maintanace_type == "2 Year") {

                $('#price1').val(9120);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Ticks" && maintanace_type == "2 Year") {

                $('#price1').val(10450);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Ticks" && maintanace_type == "2 Year") {

                $('#price1').val(11780);

            }

            //Mosquito Service - single
            if (pest_area1 == "1 RK" && pest_product1 == "Mosquitoes" && maintanace_type == "Single") {

                $('#price1').val(1300);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Mosquitoes" && maintanace_type == "Single") {

                $('#price1').val(1300);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Mosquitoes" && maintanace_type == "Single") {

                $('#price1').val(1500);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Mosquitoes" && maintanace_type == "Single") {

                $('#price1').val(1700);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Mosquitoes" && maintanace_type == "Single") {

                $('#price1').val(2000);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Mosquitoes" && maintanace_type == "Single") {

                $('#price1').val(2200);

            }

            //Disinfection Service - single
            if (pest_area1 == "1 RK" && pest_product1 == "Disinfection  Treatment" && maintanace_type == "Single") {

                $('#price1').val(2000);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Disinfection" && maintanace_type == "Single") {

                $('#price1').val(2200);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Disinfection" && maintanace_type == "Single") {

                $('#price1').val(2500);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Disinfection" && maintanace_type == "Single") {

                $('#price1').val(3000);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Disinfection" && maintanace_type == "Single") {

                $('#price1').val(3500);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Disinfection" && maintanace_type == "Single") {

                $('#price1').val(4000);

            }


            //Bed Bugs Service - single
            if (pest_area1 == "1 RK" && pest_product1 == "Bed Bugs" && maintanace_type == "3 Months") {

                $('#price1').val(5027);

            } else if (pest_area1 == "1 BHK" && pest_product1 == "Bed Bugs" && maintanace_type == "3 Months") {

                $('#price1').val(5947);

            } else if (pest_area1 == "2 BHK" && pest_product1 == "Bed Bugs" && maintanace_type == "3 Months") {

                $('#price1').val(6868);

            } else if (pest_area1 == "3 BHK" && pest_product1 == "Bed Bugs" && maintanace_type == "3 Months") {

                $('#price1').val(7717);

            } else if (pest_area1 == "4 BHK" && pest_product1 == "Bed Bugs" && maintanace_type == "3 Months") {

                $('#price1').val(8425);

            } else if (pest_area1 == "5 BHK" && pest_product1 == "Bed Bugs" && maintanace_type == "3 Months") {

                $('#price1').val(8992);

            }
            
            // Does some stuff and logs the event to the console
        });

    
})(jQuery);