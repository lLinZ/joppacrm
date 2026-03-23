<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DesignRequestComment extends Model
{
    protected $fillable = ['design_request_id', 'user_id', 'body'];

    public function designRequest()
    {
        return $this->belongsTo(DesignRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
