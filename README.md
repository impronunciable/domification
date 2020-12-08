# Domification

Chrome extension that track changes in a specific tab and get a notification when something happens. This allows to track browser changes where you want to get notified about the status update without leaving your terminal or browser. Since it uses the browser notification API, as soon as you click on the noficiation, you'll be taken to the tab where the change happened.

![domification](https://user-images.githubusercontent.com/1578458/101546402-7d456480-3987-11eb-91cc-795496bba44f.gif)


Sometimes front-end frameworks remove and re-create elements so it's not possible to highlight specific element changes. In this case, we traverse all the element parent elements and we highlight the first parent that hasn't been re-created. 
 
![domification_gh](https://user-images.githubusercontent.com/1578458/101546488-9bab6000-3987-11eb-921f-6c467670fc1c.gif)

