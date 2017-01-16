angular.module('app.controllers', [])


.controller('menuCtrl', function($scope,$http,sharedCartService,sharedFilterService) {


	//Poner carrito después del menú
	var cart = sharedCartService.cart;



	$scope.slide_items=[    {"p_id":"1",
						 "p_name":"",
						 "p_description":"Product Description",
						 "p_image_id":"slide_1",
						 "p_price":""},

						{"p_id":"2",
						"p_name":"",
						"p_description":"Product Description",
						"p_image_id":"slide_2",
						"p_price":""},

						{"p_id":"3",
						"p_name":"",
						"p_description":"Product Description",
						"p_image_id":"slide_3",
						"p_price":""}
				   ];




	$scope.noMoreItemsAvailable = false; // lazy load list




  	//Carga de menu----onload event
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();  //Agrega Scroll Infinito
	});

	// Loadmore() llama inorder para cargar lista
	$scope.loadMore = function() {

			str=sharedFilterService.getUrl();
			$http.get(str).success(function (response){
				$scope.menu_items = response.records;
				$scope.hasmore=response.has_more;	//"has_more": 0	o el número de artículos a la izquierda
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});

			//Se pueden cargar más datos o no
			if ( $scope.hasmore == 0 ) {
			  $scope.noMoreItemsAvailable = true;
			}
	};


	 //Mostrar la página del producto
	$scope.showProductInfo=function (id,desc,img,name,price) {
		 sessionStorage.setItem('product_info_id', id);
		 sessionStorage.setItem('product_info_desc', desc);
		 sessionStorage.setItem('product_info_img', img);
		 sessionStorage.setItem('product_info_name', name);
		 sessionStorage.setItem('product_info_price', price);
		 window.location.href = "#/page13";
	 };

	 //Añadir a la función de cart
	 $scope.addToCart=function(id,image,name,price){
		cart.add(id,image,name,price,1);
	 };
})

.controller('cartCtrl', function($scope,sharedCartService,$ionicPopup,$state) {

		//onload event-- to set the values
		$scope.$on('$stateChangeSuccess', function () {
			$scope.cart=sharedCartService.cart;
			$scope.total_qty=sharedCartService.total_qty;
			$scope.total_amount=sharedCartService.total_amount;
		});

		//remover function
		$scope.removeFromCart=function(c_id){
			$scope.cart.drop(c_id);
			$scope.total_qty=sharedCartService.total_qty;
			$scope.total_amount=sharedCartService.total_amount;

		};

		$scope.inc=function(c_id){
			$scope.cart.increment(c_id);
			$scope.total_qty=sharedCartService.total_qty;
			$scope.total_amount=sharedCartService.total_amount;
		};

		$scope.dec=function(c_id){
			$scope.cart.decrement(c_id);
			$scope.total_qty=sharedCartService.total_qty;
			$scope.total_amount=sharedCartService.total_amount;
		};

		$scope.checkout=function(){
			if($scope.total_amount>0){
				$state.go('checkOut');
			}
			else{
				var alertPopup = $ionicPopup.alert({
					title: 'Ningun Producto en el carrito',
					template: 'Por favor agrega un producto!'
				});
			}
		};

})

.controller('checkOutCtrl', function($scope) {
	$scope.loggedin=function(){
		if(sessionStorage.getItem('loggedin_id')==null){return 1;}
		else{
			$scope.loggedin_name= sessionStorage.getItem('loggedin_name');
			$scope.loggedin_id= sessionStorage.getItem('loggedin_id');
			$scope.loggedin_phone= sessionStorage.getItem('loggedin_phone');
			$scope.loggedin_address= sessionStorage.getItem('loggedin_address');
			$scope.loggedin_pincode= sessionStorage.getItem('loggedin_pincode');
			return 0;
		}
	};



})

.controller('indexCtrl', function($scope,sharedCartService) {
	//$scope.total = 10;
})

.controller('loginCtrl', function($scope,$http,$ionicPopup,$state,$ionicHistory) {
		$scope.user = {};

		$scope.login = function() {
			str="http://foody1.freetzi.com/user-details.php?e="+$scope.user.email+"&p="+$scope.user.password;
			$http.get(str)
			.success(function (response){
				$scope.user_details = response.records;
				sessionStorage.setItem('loggedin_name', $scope.user_details.u_name);
				sessionStorage.setItem('loggedin_id', $scope.user_details.u_id );
				sessionStorage.setItem('loggedin_phone', $scope.user_details.u_phone);
				sessionStorage.setItem('loggedin_address', $scope.user_details.u_address);
				sessionStorage.setItem('loggedin_pincode', $scope.user_details.u_pincode);

				$ionicHistory.nextViewOptions({
					disableAnimate: true,
					disableBack: true
				});
				lastView = $ionicHistory.backView();
				console.log('Last View',lastView);
				//BUG to be fixed soon
				/*if(lastView.stateId=="checkOut"){ $state.go('checkOut', {}, {location: "replace", reload: true}); }
				else{*/
		        	$state.go('profile', {}, {location: "replace", reload: true});
				//}

			}).error(function() {
					var alertPopup = $ionicPopup.alert({
						title: 'Login Fallido!',
						template: 'Por favor revisa tus datos!'
					});
			});
		};

})

.controller('signupCtrl', function($scope,$http,$ionicPopup,$state,$ionicHistory) {

	$scope.signup=function(data){

			var link = 'http://foody1.freetzi.com/signup.php';
			$http.post(link, {n : data.name, un : data.username, ps : data.password , ph: data.phone , add : data.address , pin : data.pincode })
			.then(function (res){
				$scope.response = res.data.result;



				if($scope.response.created=="1"){
					$scope.title="Cuenta creada!";
					$scope.template="Tu cuenta fue creada satisfactoriamente!";

					//no hay opcion atras
					$ionicHistory.nextViewOptions({
						disableAnimate: true,
						disableBack: true
					});
					$state.go('login', {}, {location: "replace", reload: true});

				}else if($scope.response.exists=="1"){
					$scope.title="Email Ya existente!";
					$scope.template="Por favor, haga clic en contraseña olvidada si es necesario";

				}else{
					$scope.title="Fallido";
					$scope.template="Contacta con el soporte tecnico";
				}

				var alertPopup = $ionicPopup.alert({
						title: $scope.title,
						template: $scope.template
				});


			});

	}
})

.controller('filterByCtrl', function($scope,sharedFilterService) {

  $scope.Categories = [
    {id: 1, name: 'Hamburguesas y Shawarmas'},
    {id: 2, name: 'Bebidas'},
    {id: 3, name: 'Pizzas'}
  ];

  $scope.getCategory = function(cat_list){
    categoryAdded = cat_list;
	var c_string=""; // Tendrá la categoría como un string

	for(var i=0;i<categoryAdded.length;i++){ c_string+=(categoryAdded[i].id+"||"); }

	c_string = c_string.substr(0, c_string.length-2);
	sharedFilterService.category=c_string;
	window.location.href = "#/page14";
  };


})

.controller('sortByCtrl', function($scope,sharedFilterService) {
	$scope.sort=function(sort_by){
		sharedFilterService.sort=sort_by;
		console.log('sort',sort_by);
		window.location.href = "#/page14";
	};
})

.controller('paymentCtrl', function($scope) {

})

.controller('profileCtrl', function($scope,$rootScope,$ionicHistory,$state) {

		$scope.loggedin_name= sessionStorage.getItem('loggedin_name');
		$scope.loggedin_id= sessionStorage.getItem('loggedin_id');
		$scope.loggedin_phone= sessionStorage.getItem('loggedin_phone');
		$scope.loggedin_address= sessionStorage.getItem('loggedin_address');
		$scope.loggedin_pincode= sessionStorage.getItem('loggedin_pincode');


		$scope.logout=function(){
				delete sessionStorage.loggedin_name;
				delete sessionStorage.loggedin_id;
				delete sessionStorage.loggedin_phone;
				delete sessionStorage.loggedin_address;
				delete sessionStorage.loggedin_pincode;

				console.log('Logoutctrl',sessionStorage.getItem('loggedin_id'));

				$ionicHistory.nextViewOptions({
					disableAnimate: true,
					disableBack: true
				});
				$state.go('menu', {}, {location: "replace", reload: true});
		};
})

.controller('myOrdersCtrl', function($scope) {

})

.controller('editProfileCtrl', function($scope) {

})

.controller('favoratesCtrl', function($scope) {

})

.controller('shop1Ctrl', function($scope,$http,sharedCartService,sharedFilterService){


  	//poner carrito despues del menu
  	var cart = sharedCartService.cart;


  	$scope.noMoreItemsAvailable = false; // lazy load list


    	//loads the menu----onload event
  	$scope.$on('$stateChangeSuccess', function() {
  		$scope.loadMore();  //Added Infine Scroll
  	});

  	// Loadmore() called inorder to load the list
  	$scope.loadMore = function() {

  			str=sharedFilterService.getUrl();
  			$http.get(str).success(function (response){
  				$scope.menu_items = response.records;
  				$scope.hasmore=response.has_more;	//"has_more": 0	or number of items left
  				$scope.$broadcast('scroll.infiniteScrollComplete');
  			});

  			//more data can be loaded or not
  			if ( $scope.hasmore == 0 ) {
  			  $scope.noMoreItemsAvailable = true;
  			}
  	};


  	 //show product page
  	$scope.showProductInfo=function (id,desc,img,name,price) {
  		 sessionStorage.setItem('product_info_id', id);
  		 sessionStorage.setItem('product_info_desc', desc);
  		 sessionStorage.setItem('product_info_img', img);
  		 sessionStorage.setItem('product_info_name', name);
  		 sessionStorage.setItem('product_info_price', price);
  		 window.location.href = "#/page13";
  	 };

  	 //add to cart function
  	 $scope.addToCart=function(id,image,name,price){
  		cart.add(id,image,name,price,1);
  	 };
  })

  .controller('shop2Ctrl', function($scope) {

  })

  .controller('shop3Ctrl', function($scope) {

  })

  .controller('shop4Ctrl', function($scope) {

  })



.controller('productPageCtrl', function($scope) {

	//onload event
	angular.element(document).ready(function () {
		$scope.id= sessionStorage.getItem('product_info_id');
		$scope.desc= sessionStorage.getItem('product_info_desc');
		$scope.img= "img/"+ sessionStorage.getItem('product_info_img')+".jpg";
		$scope.name= sessionStorage.getItem('product_info_name');
		$scope.price= sessionStorage.getItem('product_info_price');
	});

})

.controller("sliderController", function($scope){
$scope.items = [
  {
    src:'img/shop1.jpg',
    sub: 'TropiPizza te brinda la mejor manera de conseguir tu comida al alcance de tus dedos, desde cualquier lugar donde te encuentres!<br><h2><center><a href="#page14"> Visitar la tienda</a></center>',


  },
	{
    src:'img/shop2.jpg',
    sub: '<h2><center><a href="#page15"> Visitar la tienda</a></center>',


  },
	{
    src:'img/shop3.jpg',
    sub: '<h2><center><a href="#page16"> Visitar la tienda</a></center>'
  },
	{
    src:'https://yt3.ggpht.com/-avTHbIvvjKY/AAAAAAAAAAI/AAAAAAAAAAA/GtO4B-SrWkA/s900-c-k-no-mo-rj-c0xffffff/photo.jpg',
    sub: '<h2><center><a href="#page17"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop5.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop6.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop7.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop8.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop9.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop10.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop11.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop12.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop13.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop14.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop15.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop16.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop17.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  },
	{
    src:'img/shop18.jpg',
    sub: '<h2><center><a href="#page14"> Visitar la tienda</a></center>'
  }

]

});
