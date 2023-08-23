/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your Pedidos ViewModel code goes here
 */
define(["knockout",
        "appController",
        "ojs/ojmodule-element-utils",
        "accUtils",
        "../httpUtil",
        "ojs/ojarraydataprovider",
        "ojs/ojknockout-keyset",
        "ojs/ojkeyset",
        "ojs/ojknockout",
        "ojs/ojlistview",
        "ojs/ojswitch",
        "ojs/ojlabel",
        "ojs/ojavatar",
        "ojs/ojlistitemlayout",
        "ojs/ojselector",
        "ojs/ojbutton",
        "ojs/ojdialog",
        "ojs/ojinputnumber",
        "ojs/ojinputtext"],
 function(ko, app, moduleUtils, accUtils, Util, ArrayDataProvider, KeySet, KeySetImpl) {

    function PurchaseOrdersViewModel() {

      const headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      let showListView = ko.observable(false);

      Util.callGetService()
        .then( (response) => {
          this.dataProvider = new ArrayDataProvider(response, {
            keyAttributes: 'id'
          });
          showListView(true);
      });

      let selectedItems = new KeySet.ObservableKeySet();
      
      const handleSelectedChanged = (event) => {
        if (event.detail.items) {
          event.detail.value.keys.keys.forEach( (item) => {
            openProductDetails(item);
          })
        }
      };

      const filterProducts = function (event) {
        const _products = document.querySelectorAll("#listview li");
        let _filter = event.detail.value;

        /// USAR RAW-VALUE !!!!

        if (_filter != null) {
          _products.forEach( (item) => {
            let _name = item.querySelector(".product-name");
            _name = _name.textContent.toLowerCase();
            let _filterText = _filter.toLowerCase();
            if (!_name.trim(_name).includes(_filterText)) {
              item.style.display = "none";
            } else {
              item.style.display = "block";
            }
          })
        } else {
          _products.forEach( (item) => {
            item.style.display = "block";
          })
        }
      }.bind(this);

      const _pedido = new Object();
      
      const getDisplayValue = ({ keys }) => {
        
        if (keys) {
          const _keysListOrder = [ ...keys.keys.values() ].sort( (a, b) => {
            return a.id - b.id;
          })

          const _keysList = _keysListOrder.map( (item, index) => {

            const _buscarQuantidade = this.dataProvider.data.find( (produto) => {
              return produto.id == item.id
            })

            return {
              id: item.id,
              name: item.name,
              title: item.title,
              unitPrice: item.unitPrice,
              quantity: _buscarQuantidade.quantity,
              totalPrice: parseInt(item.unitPrice) * parseInt(_buscarQuantidade.quantity) 
            } 
          })

          const _set = _keysList;
          
          _pedido.pedido = 1;

          _pedido.items = new Array(); 

          _set.map( (item) => {
            _pedido.items.push({ 
              produto: `${item.name}`,
              unitPrice: `${item.unitPrice}`,
              quantity: `${item.quantity}`,
              totalPrice: `${item.totalPrice}`
            });
          })
          
          const _getSum = (total, num) => {
            if (!total) {
              total = 0; 
            }
            if (!num) {
              num = 0; 
            }
            return parseInt(total) + parseInt(num.totalPrice);
          }

          if (_pedido.items) {
            _pedido.totalOrder = _pedido.items.reduce(_getSum, 0);      
          }

          localStorage.setItem("PURCHASE_ORDER", JSON.stringify(_pedido));

          return `${_pedido.totalOrder}`;
        }
      }

      const getSelectedItems = (row) => {
          return {
            id: `${row.id}`,
            name: `${row.name}`,
            title: `${row.title}`,
            unitPrice: `${row.unitPrice}`,
            quantity: `${row.quantity}`
          };
      }

      const openProductDetails = (id) => {
        document.getElementById(`product-details${id}`).open();
      }

      this.closeProductDetails = (id, event) => {
        if (event) { 
          document.getElementById(`product-details${event.data.id}`).close();
          
          const index = event.data.id - 1;

          const selected = document.querySelectorAll(`[aria-label="${event.data.name} selecionado"]`).length;
          if (selected > 0) {
            document.getElementsByClassName(`oj-selectorbox`)[index].click();
          }
          //For further implementation
          //_uncheckListItemSelected(event.data.id);
        }
      }

      const _uncheckListItemSelected = (key) => {
        let keySI = new Set();
        keySI.add(key);
        keySI = new KeySetImpl.KeySetImpl(keySI);
        const checkbox = document.querySelectorAll(".oj-selectorbox")[key];
        checkbox.id = `checkbox-${key}`;
        document.getElementById(`checkbox-${key}`).setProperty("checked", keySI);
        
        //document.getElementById(`listview_checkboxset${key}`).setProperty("checked", keySI);
      };

      this.closeInfoRegister = () => {
        document.getElementById("info-register").close();
      }

      const sendPurchaseOrderWhatsApp = () => {
        const _customerData = JSON.parse(localStorage.getItem("REGISTER"));
        const _purchaseOrder = JSON.parse(localStorage.getItem("PURCHASE_ORDER"));
        
        if (!_customerData) {
          document.getElementById("info-register").open();
        } else {
          const _customerMessage = `Olá ! Sou o(a) _*${_customerData.clientName}*_ da cidade de _*${_customerData.clientCity}*_`;
          const _itens = _purchaseOrder.items.map( (item, idx) => {
            return `${++idx} : ${item.produto} - _${item.quantity} unidade(s)_`;
          })
  
          const _messagePurchaseOrder = `*Solicito a compra dos seguintes produtos:*\n\n${_itens.join('\n')}\n\n*Valor Total*: R$ ${_purchaseOrder.totalOrder}\n\nObrigado(a) !!`;
  
          const _messagePurchaseOrderWhatsApp = window.encodeURIComponent(`${_customerMessage}\n\n${_messagePurchaseOrder}`);
  
          const _URL = `https://api.whatsapp.com/send?l=pt-BR&phone=XXX&text=${_messagePurchaseOrderWhatsApp}`;
          window.location = _URL;
        }
      }
      
      this.connected = function() {
        accUtils.announce('Pedidos page loaded.');
        document.title = "Pedidos";
      };

      this.disconnected = function() {
        // Implement if needed
      };

      this.transitionCompleted = function() {
        // Implement if needed
      };

      this.headerConfig = headerConfig;
      this.showListView = showListView;
      this.filterProducts = filterProducts;
      this.handleSelectedChanged = handleSelectedChanged;
      this.selectedItems = selectedItems;
      this.filterProducts = filterProducts;
      this.getSelectedItems = getSelectedItems;
      this.getDisplayValue = getDisplayValue;
      this.openProductDetails = openProductDetails;
      this.sendPurchaseOrderWhatsApp = sendPurchaseOrderWhatsApp; 
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return PurchaseOrdersViewModel;
  }
);
