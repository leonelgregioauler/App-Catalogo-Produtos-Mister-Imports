/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your Cadastros ViewModel code goes here
 */
define(["knockout",
        "appController",
        "ojs/ojmodule-element-utils",
        "accUtils",
        "ojs/ojmutablearraydataprovider",
        "ojs/ojinputtext",
        "ojs/ojinputnumber",
        "ojs/ojlabel",
        "ojs/ojbutton",
        "ojs/ojformlayout",
        "ojs/ojmessagebanner"],
 function(ko,
          app,
          moduleUtils,
          accUtils,
          MutableArrayDataProvider) {

    function CustomerRegistrationViewModel() {

      const headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      const clientName = ko.observable();
      const clientCity = ko.observable();
      let showMessage = ko.observable(false);
      const _initialData = new Array();
      
      const isBlankText = ko.computed( () => {
        return !clientName() && !clientCity(); 
      }, this);

      const sendCustomerRegistration = () => {
        const _customerRegistration = {
          clientName: clientName(),
          clientCity: clientCity()
        }

        _initialData.push({
          id: 'confirmation-1',
          severity: 'confirmation',
          summary: 'Mensagem de Confirmação',
          detail: 'Cadastro efetuado com sucesso !'
        });

        this.messages = new MutableArrayDataProvider(_initialData, {
          keyAttributes: 'id'
        });

        showMessage(true);
        
        localStorage.setItem("REGISTER", JSON.stringify(_customerRegistration));
      }

      const _queryCustomerRegistration = () => {
        const _customer = JSON.parse(localStorage.getItem("REGISTER"));
        if (_customer) {
          clientName(_customer.clientName);
          clientCity(_customer.clientCity);
        }
      }

      this.messages = new MutableArrayDataProvider(_initialData, {
        keyAttributes: 'id'
      });

      const closeMessage = (event) => {
        let _data = this.messages.data.slice();
        const _closeMessageKey = event.detail.key;
        _data = _data.filter((message) => message.id !== _closeMessageKey);
        this.messages.data = _data;
        showMessage(false);
      };

      this.connected = function() {
        accUtils.announce('Cadastros page loaded.');
        document.title = "Cadastros";
        _queryCustomerRegistration();
      };

      this.disconnected = function() {
        // Implement if needed
      };

      this.transitionCompleted = function() {
        // Implement if needed
      };

      this.headerConfig = headerConfig;
      this.clientName = clientName;
      this.clientCity = clientCity;
      this.showMessage = showMessage;
      this.isBlankText = isBlankText;
      this.sendCustomerRegistration = sendCustomerRegistration;
      this.closeMessage = closeMessage;
    }

    return CustomerRegistrationViewModel;
  }
);
