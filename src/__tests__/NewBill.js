/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen, waitFor } from "@testing-library/dom"
 import NewBillUI from "../views/NewBillUI.js"
 import BillsUI from "../views/BillsUI.js";
 import NewBill from "../containers/NewBill.js"
 import mockStore from "../__mocks__/store";
 import { ROUTES, ROUTES_PATH } from "../constants/routes";
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import userEvent from "@testing-library/user-event"
 import router from "../app/Router.js";
 import Store from "../app/Store";
 
 jest.mock("../app/Store", () => mockStore)
 

 
 describe("Given I am connected as an employee", () => {
  describe("When I am on new Bill Page", () => {
    it("should display mail icon highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      //check if dashboard icon is highlighted with the class 'active-icon
      expect(mailIcon.className).toBe("active-icon")
    })

  })
  describe("when I submit the form with empty fields", () => {
    test("then I should stay on new Bill page", () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      const newBill = new NewBill({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      expect(screen.getByTestId("expense-name").value).toBe("");
      expect(screen.getByTestId("datepicker").value).toBe("");
      expect(screen.getByTestId("amount").value).toBe("");
      expect(screen.getByTestId("vat").value).toBe("");
      expect(screen.getByTestId("pct").value).toBe("");
      expect(screen.getByTestId("file").value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
  });
});


const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({pathname});
};


 describe("Given I am connected as an employee and i'm on NeWBill page", () => {
   beforeEach(() => {
     localStorage.setItem(
       'user',
       JSON.stringify({
         type: 'Employee'
       })
     )
     Object.defineProperty(window, 'location', {
       value: {
         hash: ROUTES_PATH['NewBill']
       }
     })
   })
 
   // Test d'intégration POST
   describe('When I submit a new Bill on correct format', () => { 
     it('should be succesfull', () => { 
       const html = NewBillUI()
       document.body.innerHTML = html
       const newBill1 = new NewBill({
         document, onNavigate, localStorage: window.localStorage
       });
       const formNewBill = screen.getByTestId("form-new-bill")
       expect(formNewBill).toBeTruthy()
       const handleSubmit = jest.fn((e) => newBill1.handleSubmit(e))
       formNewBill.addEventListener("submit", handleSubmit);
       fireEvent.submit(formNewBill);
       expect(handleSubmit).toHaveBeenCalled();      
     })
     it('should fetch bills from mock API POST', async () => { 
       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.NewBill)
      })
      it("should verify the file bill", async() => {
       jest.spyOn(mockStore, "bills")
       Object.defineProperty(
           window,
           "localStorage",
           { value: localStorageMock }
       )
       window.localStorage.setItem("user", JSON.stringify({
         type: "Employee",
         email: "a@a"
       }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.appendChild(root)
       router()
 
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname })
       }
 
       Object.defineProperty(window, "localStorage", { value: localStorageMock })
       Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
       window.localStorage.setItem("user", JSON.stringify({
         type: "Employee"
       }))
 
       const newBillInit = new NewBill({
         document, onNavigate, store: mockStore, localStorage: window.localStorage
       })
 
       const file = new File(['image'], 'image.png', {type: 'image/png'});
       const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
       const formNewBill = screen.getByTestId("form-new-bill")
       const billFile = screen.getByTestId('file');
 
       billFile.addEventListener("change", handleChangeFile);     
       userEvent.upload(billFile, file)
       
       expect(billFile.files[0].name).toBeDefined()
       expect(handleChangeFile).toBeCalled()
      
       const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
       formNewBill.addEventListener("submit", handleSubmit);     
       fireEvent.submit(formNewBill);
       expect(handleSubmit).toHaveBeenCalled();
     })
     describe('When an error occurs', () => { 
       jest.spyOn(mockStore, "bills")
       Object.defineProperty(
         window,
         'localStorage',
         { value: localStorageMock }
         )
         window.localStorage.setItem('user', JSON.stringify({
           type: 'Employee',
           email: "a@a"
          }))
          it("Should fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 404"));
                },
              };
            });
            const html = BillsUI({ error: "Erreur 404" })
            document.body.innerHTML = html
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
          });
          test('should fail with 500 message error', async () => { 
         mockStore.bills.mockImplementationOnce(() => {
           return {
             create : () =>  {
               return Promise.reject(new Error("Erreur 500"))
             }
           }})
           const html = BillsUI({ error: "Erreur 500" });
           document.body.innerHTML = html;
           const message = await screen.getByText(/Erreur 500/);
           expect(message).toBeTruthy();       })
      })
    })
 
   describe("When I upload an incorrect file", () => {
     test("Then the upload fail", () => {
       const html = NewBillUI()
       document.body.innerHTML = html
       const file = screen.getByTestId("file")
       const newBill = new NewBill({
         document,
         onNavigate,
         store: Store,
         localStorage: window.localStorage
       })
       const handleChangeFile = jest.fn(newBill.handleChangeFile)
       file.addEventListener("change", handleChangeFile)
       fireEvent.change(file, {
         target: {
             files: [new File(["image"], "test.pdf", {type: "image/pdf"})]
         }
       })
       expect(file.value).toBe('')
     })
   })
 })