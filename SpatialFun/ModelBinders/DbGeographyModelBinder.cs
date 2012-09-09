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
            if (valueProviderResult != null && !string.IsNullOrWhiteSpace(valueProviderResult.AttemptedValue))
            {
                try
                {
                    DbGeography result = DbGeography.FromText(valueProviderResult.AttemptedValue);
                    return result;
                }
                catch (Exception)
                {
                    return null; 
                    throw;
                }
              
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