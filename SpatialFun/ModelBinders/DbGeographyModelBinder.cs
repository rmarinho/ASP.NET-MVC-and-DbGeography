using System;
using System.Collections.Generic;
using System.Data.Spatial;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication2
{
    public class DbGeographyModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
            if (valueProviderResult != null)
            {
                DbGeography result = DbGeography.FromText(valueProviderResult.AttemptedValue, 4326);
                return result;
            } 
            return null;
        }
    }

    public class EFModelBinderProvider : IModelBinderProvider
    {
        public IModelBinder GetBinder(Type modelType)
        {
            if (modelType == typeof(DbGeography))
            {
                return new DbGeographyModelBinder();
            }
            return null;
        }
    }
}