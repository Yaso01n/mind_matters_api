#!/usr/bin/env python
# coding: utf-8

# In[38]:


import torch
import torch.optim
from transformers import AutoTokenizer, AutoModel
import torch.nn as nn
import gdown
import os


# In[2]:


SEED = 42
device = 'cuda' if torch.cuda.is_available() else 'cpu'
torch.manual_seed(SEED)


# In[9]:


MAX_LEN = 139
marbert_model = 'UBC-NLP/MARBERT'


# In[10]:


tokenizer = AutoTokenizer.from_pretrained(marbert_model)
target = ['Depression', 'Depression-with-Suicidal-Thoughts', 'Non-Depression']


# In[11]:


class MARBERT(torch.nn.Module):
    def __init__(self, drop_out=0.3, output_size=3):
        super(MARBERT, self).__init__()
        self.marbert_model = 'UBC-NLP/MARBERT'
        self.tokenizer = AutoTokenizer.from_pretrained(marbert_model)
        self.bert_model = AutoModel.from_pretrained(marbert_model).to(device)
        self.dropout = torch.nn.Dropout(drop_out)
        self.linear = torch.nn.Linear(768, output_size)

    def forward(self, input_ids, attn_mask, token_type_ids):
        output = self.bert_model(
            input_ids,
            attention_mask=attn_mask,
            token_type_ids=token_type_ids
        )
        output_dropout = self.dropout(output.pooler_output)
        output = self.linear(output_dropout)
        return output


# In[12]:


# model = MARBERT().to(device)


# In[39]:


def predict_label(raw_text, model, model_url):
    local_model_path = 'marbert_model.pt'

    # Download the model file from Google Drive if not already downloaded
    if not os.path.exists(local_model_path):
        gdown.download(model_url, local_model_path, quiet=False)

    # Load the trained model
    model.load_state_dict(torch.load(local_model_path, map_location=device))
    model.eval()

    # Tokenize input text
    encoded_text = tokenizer.encode_plus(
        raw_text, 
        max_length=MAX_LEN, 
        add_special_tokens=True, 
        return_token_type_ids=True, 
        pad_to_max_length=True, 
        return_attention_mask=True, 
        return_tensors='pt'
    )
    
    # Move tensors to the appropriate device
    input_ids = encoded_text['input_ids'].to(device)
    attention_mask = encoded_text['attention_mask'].to(device)
    token_type_ids = encoded_text['token_type_ids'].to(device)

    # Get model predictions
    with torch.no_grad():
        output = model(input_ids, attention_mask, token_type_ids)
    
    # Apply sigmoid activation and round predictions
    output = torch.sigmoid(output).detach().cpu().numpy().flatten().round()
    
    # Print the predicted labels
    for idx, p in enumerate(output):
        if p == 1:
            print(f"Label: {target[idx]}")
    result_labels = [target[idx] for idx, p in enumerate(output) if p == 1]  # Return result for API
    return ', '.join(result_labels)  # Return result as a comma-separated string



# In[ ]:





# In[40]:


# model_path = "https://drive.google.com/uc?id=1rgj7HVCh-h2OCcihWbsFHQwncfhBh59i"


# In[41]:


# predict_label("أشعر بالسعادة عندما أرى الأشخاص الذين أحبهم يبتسمون ويشعرون بالرضا والسرور", model, model_path)


# In[37]:


# predict_label("أحيانًا أشعر بعدم الرغبة في مواصلة الحياة، وأحلم بالابتعاد عن كل هذه الألم والضغوطات", model, model_path)


# In[19]:




# In[ ]:

def arabic_prediction(text):
    model_path = "https://drive.google.com/uc?id=1rgj7HVCh-h2OCcihWbsFHQwncfhBh59i"
    model = MARBERT().to(device)
    print('111')
    result = predict_label(text,model,model_path)
    return result

# result = arabic_prediction("حاسس مليش لازمة في الدنيا دي وبفكر اني أموت")
# print(result)
